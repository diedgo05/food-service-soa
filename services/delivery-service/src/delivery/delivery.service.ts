import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryPerson } from './entities/delivery-person.entity';
import { Delivery, DeliveryStatus } from './entities/delivery.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryPerson) private personRepo: Repository<DeliveryPerson>,
    @InjectRepository(Delivery) private deliveryRepo: Repository<Delivery>,
  ) {}

  findAllPersons() {
    return this.personRepo.find();
  }

  async checkAvailability() {
    const person = await this.personRepo.findOne({ where: { isAvailable: true } });
    if (!person) return { available: false };
    return {
      available: true,
      deliveryPersonId: person.id,
      deliveryPersonName: person.name,
    };
  }

  async assign(orderId: number, deliveryPersonId: number) {
    const person = await this.personRepo.findOne({ where: { id: deliveryPersonId } });
    if (!person) return { assigned: false, error: 'Repartidor no encontrado' };
    if (!person.isAvailable) return { assigned: false, error: 'Repartidor no disponible' };

    person.isAvailable = false;
    person.currentOrderId = orderId;
    await this.personRepo.save(person);

    const delivery = await this.deliveryRepo.save({
      orderId,
      deliveryPersonId,
      status: DeliveryStatus.ASSIGNED,
    });

    return { assigned: true, deliveryId: delivery.id };
  }

  async release(deliveryId: number) {
    const delivery = await this.deliveryRepo.findOne({ where: { id: deliveryId } });
    if (!delivery) return { released: false };

    delivery.status = DeliveryStatus.CANCELLED;
    await this.deliveryRepo.save(delivery);

    const person = await this.personRepo.findOne({ where: { id: delivery.deliveryPersonId } });
    if (person) {
      person.isAvailable = true;
      person.currentOrderId = null;
      await this.personRepo.save(person);
    }

    return { released: true };
  }

  async findDelivery(id: number) {
    const delivery = await this.deliveryRepo.findOne({ where: { id } });
    if (!delivery) throw new NotFoundException(`Entrega ${id} no encontrada`);
    return delivery;
  }

  async updateStatusByOrderId(orderId: number, status: DeliveryStatus) {
    const delivery = await this.deliveryRepo.findOne({ where: { orderId } });
    if (delivery) {
      delivery.status = status;
      await this.deliveryRepo.save(delivery);
      console.log(`Delivery for order ${orderId} updated to ${status}`);
    }
  }
}
