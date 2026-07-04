import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { SagaModule } from '../saga/saga.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), SagaModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
