import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryPerson } from '../delivery/entities/delivery-person.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryPerson])],
  providers: [SeedService],
})
export class SeedModule {}
