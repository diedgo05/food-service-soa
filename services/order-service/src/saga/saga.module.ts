import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderSagaService } from './order-saga.service';

@Module({
  imports: [HttpModule],
  providers: [OrderSagaService],
  exports: [OrderSagaService],
})
export class SagaModule {}
