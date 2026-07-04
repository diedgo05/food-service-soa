import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderSagaService } from '../saga/order-saga.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private readonly saga: OrderSagaService,
  ) {}

  async create(dto: {
    restaurantId: number;
    items: { menuItemId: number; quantity: number }[];
    customerName: string;
    deliveryAddress: string;
  }) {
    // 1. Create order in PENDING state
    const order = await this.orderRepo.save({
      restaurantId: dto.restaurantId,
      items: dto.items,
      status: OrderStatus.PENDING,
      customerName: dto.customerName,
      deliveryAddress: dto.deliveryAddress,
    });

    // 2. Execute Saga orchestration
    const result = await this.saga.execute({
      orderId: order.id,
      restaurantId: dto.restaurantId,
      items: dto.items,
      customerName: dto.customerName,
      deliveryAddress: dto.deliveryAddress,
    });

    // 3. Update order based on saga result
    if (result.success) {
      order.status = OrderStatus.CONFIRMED;
      order.totalAmount = result.totalAmount;
      order.deliveryPersonId = result.deliveryPersonId;
      order.deliveryId = result.deliveryId;
      order.reservationId = result.reservationId;
    } else {
      order.status = OrderStatus.CANCELLED;
      order.failureReason = result.failureReason;
    }

    return this.orderRepo.save(order);
  }

  findAll() {
    return this.orderRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Pedido ${id} no encontrado`);
    return order;
  }
}
