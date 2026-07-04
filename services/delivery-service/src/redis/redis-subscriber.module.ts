import { Module } from '@nestjs/common';
import { RedisSubscriberService } from './redis-subscriber.service';
import { DeliveryModule } from '../delivery/delivery.module';

@Module({
  imports: [DeliveryModule],
  providers: [RedisSubscriberService],
})
export class RedisSubscriberModule {}
