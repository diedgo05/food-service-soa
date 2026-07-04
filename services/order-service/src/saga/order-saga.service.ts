import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisPublisherService } from '../redis/redis.service';

interface SagaContext {
  orderId: number;
  restaurantId: number;
  items: { menuItemId: number; quantity: number }[];
  customerName: string;
  deliveryAddress: string;
  // Saga state for compensation
  reservationId?: string;
  deliveryPersonId?: number;
  deliveryId?: number;
  totalAmount?: number;
}

interface SagaResult {
  success: boolean;
  totalAmount?: number;
  deliveryPersonId?: number;
  deliveryId?: number;
  reservationId?: string;
  failureReason?: string;
}

@Injectable()
export class OrderSagaService {
  private readonly logger = new Logger(OrderSagaService.name);
  private readonly restaurantUrl: string;
  private readonly deliveryUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly redisPublisher: RedisPublisherService,
  ) {
    this.restaurantUrl = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3001';
    this.deliveryUrl = process.env.DELIVERY_SERVICE_URL || 'http://localhost:3002';
  }

  async execute(ctx: SagaContext): Promise<SagaResult> {
    this.logger.log(`▶ SAGA START — Order #${ctx.orderId}`);

    // ── Step 1: Validate items via REST (sync) ──────────────
    try {
      this.logger.log(`  Step 1: Validating items at restaurant ${ctx.restaurantId}`);
      const validateRes = await firstValueFrom(
        this.httpService.post(
          `${this.restaurantUrl}/restaurants/${ctx.restaurantId}/validate-items`,
          { items: ctx.items },
        ),
      );

      if (!validateRes.data.valid) {
        this.logger.warn(`  Step 1 FAILED: ${validateRes.data.error}`);
        return { success: false, failureReason: `Validación fallida: ${validateRes.data.error}` };
      }
      ctx.totalAmount = validateRes.data.totalAmount;
      this.logger.log(`  Step 1 OK: total = $${ctx.totalAmount}`);
    } catch (err) {
      this.logger.error(`  Step 1 ERROR: ${err.message}`);
      return { success: false, failureReason: `Restaurant Service no disponible: ${err.message}` };
    }

    // ── Step 2: Reserve stock via REST (sync) ───────────────
    try {
      this.logger.log(`  Step 2: Reserving stock at restaurant ${ctx.restaurantId}`);
      const reserveRes = await firstValueFrom(
        this.httpService.post(
          `${this.restaurantUrl}/restaurants/${ctx.restaurantId}/reserve-stock`,
          { items: ctx.items },
        ),
      );

      if (!reserveRes.data.reserved) {
        this.logger.warn(`  Step 2 FAILED: ${reserveRes.data.error}`);
        return { success: false, failureReason: `Reserva fallida: ${reserveRes.data.error}` };
      }
      ctx.reservationId = reserveRes.data.reservationId;
      this.logger.log(`  Step 2 OK: reservationId = ${ctx.reservationId}`);
    } catch (err) {
      this.logger.error(`  Step 2 ERROR: ${err.message}`);
      return { success: false, failureReason: `Error al reservar stock: ${err.message}` };
    }

    // ── Step 3: Check delivery availability via REST (sync) ─
    try {
      this.logger.log(`  Step 3: Checking delivery availability`);
      const availRes = await firstValueFrom(
        this.httpService.post(`${this.deliveryUrl}/delivery/check-availability`, {}),
      );

      if (!availRes.data.available) {
        this.logger.warn(`  Step 3 FAILED: No riders available`);
        // ── COMPENSATION: Release stock ──
        await this.compensateStock(ctx);
        return { success: false, failureReason: 'No hay repartidores disponibles' };
      }
      ctx.deliveryPersonId = availRes.data.deliveryPersonId;
      this.logger.log(`  Step 3 OK: rider ${ctx.deliveryPersonId} available`);
    } catch (err) {
      this.logger.error(`  Step 3 ERROR: ${err.message}`);
      await this.compensateStock(ctx);
      return { success: false, failureReason: `Delivery Service no disponible: ${err.message}` };
    }

    // ── Step 4: Assign delivery person via REST (sync) ──────
    try {
      this.logger.log(`  Step 4: Assigning rider ${ctx.deliveryPersonId} to order ${ctx.orderId}`);
      const assignRes = await firstValueFrom(
        this.httpService.post(`${this.deliveryUrl}/delivery/assign`, {
          orderId: ctx.orderId,
          deliveryPersonId: ctx.deliveryPersonId,
        }),
      );

      if (!assignRes.data.assigned) {
        this.logger.warn(`  Step 4 FAILED: ${assignRes.data.error}`);
        await this.compensateStock(ctx);
        return { success: false, failureReason: `Asignación fallida: ${assignRes.data.error}` };
      }
      ctx.deliveryId = assignRes.data.deliveryId;
      this.logger.log(`  Step 4 OK: deliveryId = ${ctx.deliveryId}`);
    } catch (err) {
      this.logger.error(`  Step 4 ERROR: ${err.message}`);
      await this.compensateStock(ctx);
      return { success: false, failureReason: `Error al asignar repartidor: ${err.message}` };
    }

    // ── Step 5: Publish event via Redis (async) ─────────────
    await this.redisPublisher.publish('order.confirmed', {
      orderId: ctx.orderId,
      restaurantId: ctx.restaurantId,
      deliveryPersonId: ctx.deliveryPersonId,
      totalAmount: ctx.totalAmount,
      customerName: ctx.customerName,
      deliveryAddress: ctx.deliveryAddress,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`✔ SAGA COMPLETE — Order #${ctx.orderId} CONFIRMED`);
    return {
      success: true,
      totalAmount: ctx.totalAmount,
      deliveryPersonId: ctx.deliveryPersonId,
      deliveryId: ctx.deliveryId,
      reservationId: ctx.reservationId,
    };
  }

  private async compensateStock(ctx: SagaContext) {
    if (!ctx.reservationId) return;
    try {
      this.logger.warn(`  ↩ COMPENSATING: Releasing stock reservation ${ctx.reservationId}`);
      await firstValueFrom(
        this.httpService.post(
          `${this.restaurantUrl}/restaurants/${ctx.restaurantId}/release-stock`,
          { reservationId: ctx.reservationId },
        ),
      );
      this.logger.log(`  ↩ Compensation OK: stock released`);

      await this.redisPublisher.publish('order.cancelled', {
        orderId: ctx.orderId,
        reason: 'Saga compensation - delivery assignment failed',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.error(`  ↩ COMPENSATION FAILED: ${err.message}`);
    }
  }
}
