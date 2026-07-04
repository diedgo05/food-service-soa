import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryPerson } from '../delivery/entities/delivery-person.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(DeliveryPerson) private personRepo: Repository<DeliveryPerson>,
  ) {}

  async onModuleInit() {
    const count = await this.personRepo.count();
    if (count > 0) return;

    await this.personRepo.save([
      { name: 'Carlos Méndez', phone: '961-100-0001', isAvailable: true },
      { name: 'Lucía Hernández', phone: '961-100-0002', isAvailable: true },
      { name: 'Roberto Gómez', phone: '961-100-0003', isAvailable: true },
      { name: 'Ana Torres', phone: '961-100-0004', isAvailable: false, currentOrderId: 99 },
    ]);

    console.log('Seed data inserted: 4 delivery persons (3 available, 1 busy)');
  }
}
