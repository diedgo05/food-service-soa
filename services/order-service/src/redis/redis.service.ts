import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisPublisherService implements OnModuleDestroy {
  private publisher: Redis;

  constructor() {
    this.publisher = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL)
      : new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
        });
  }

  async publish(channel: string, data: any) {
    const message = JSON.stringify(data);
    await this.publisher.publish(channel, message);
    console.log(`[Redis] Published to ${channel}: ${message}`);
  }

  async onModuleDestroy() {
    await this.publisher?.quit();
  }
}