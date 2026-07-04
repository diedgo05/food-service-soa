import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { DeliveryService } from '../delivery/delivery.service';
import { DeliveryStatus } from '../delivery/entities/delivery.entity';

@Injectable()
export class RedisSubscriberService implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis;

  constructor(private readonly deliveryService: DeliveryService) {}

  async onModuleInit() {
    this.subscriber = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL)
      : new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
        });

    await this.subscriber.subscribe('order.confirmed', 'order.cancelled');
    console.log('Delivery Service subscribed to: order.confirmed, order.cancelled');

    this.subscriber.on('message', async (channel, message) => {
      console.log(`[Redis] Received on ${channel}: ${message}`);
      try {
        const data = JSON.parse(message);

        if (channel === 'order.confirmed') {
          await this.deliveryService.updateStatusByOrderId(
            data.orderId,
            DeliveryStatus.PICKED_UP,
          );
          console.log(`Order ${data.orderId} confirmed → delivery status updated to PICKED_UP`);
        }

        if (channel === 'order.cancelled') {
          await this.deliveryService.updateStatusByOrderId(
            data.orderId,
            DeliveryStatus.CANCELLED,
          );
          console.log(`Order ${data.orderId} cancelled → delivery status updated to CANCELLED`);
        }
      } catch (err) {
        console.error('Error processing Redis message:', err);
      }
    });
  }

  async onModuleDestroy() {
    await this.subscriber?.quit();
  }
}