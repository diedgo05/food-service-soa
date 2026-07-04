import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-item.entity';
import { v4 as uuidv4 } from 'uuid';

interface Reservation {
  items: { menuItemId: number; quantity: number }[];
  restaurantId: number;
  createdAt: Date;
}

@Injectable()
export class RestaurantsService {
  private reservations = new Map<string, Reservation>();

  constructor(
    @InjectRepository(Restaurant) private restaurantRepo: Repository<Restaurant>,
    @InjectRepository(MenuItem) private menuItemRepo: Repository<MenuItem>,
  ) {}

  findAll() {
    return this.restaurantRepo.find();
  }

  async findOne(id: number) {
    const restaurant = await this.restaurantRepo.findOne({ where: { id } });
    if (!restaurant) throw new NotFoundException(`Restaurante ${id} no encontrado`);
    return restaurant;
  }

  async getMenu(restaurantId: number) {
    await this.findOne(restaurantId);
    return this.menuItemRepo.find({ where: { restaurantId, isAvailable: true } });
  }

  async validateItems(restaurantId: number, items: { menuItemId: number; quantity: number }[]) {
    await this.findOne(restaurantId);
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await this.menuItemRepo.find({
      where: { id: In(menuItemIds), restaurantId },
    });

    if (menuItems.length !== menuItemIds.length) {
      const found = menuItems.map((m) => m.id);
      const missing = menuItemIds.filter((id) => !found.includes(id));
      return { valid: false, totalAmount: 0, details: [], error: `Ítems no encontrados: ${missing.join(', ')}` };
    }

    const details = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        unitPrice: Number(menuItem.price),
        quantity: item.quantity,
        subtotal: Number(menuItem.price) * item.quantity,
      };
    });

    const insufficientStock = items.filter((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return menuItem.stock < item.quantity;
    });

    if (insufficientStock.length > 0) {
      return {
        valid: false, totalAmount: 0, details,
        error: `Stock insuficiente para ítems: ${insufficientStock.map((i) => i.menuItemId).join(', ')}`,
      };
    }

    const totalAmount = details.reduce((sum, d) => sum + d.subtotal, 0);
    return { valid: true, totalAmount, details };
  }

  async reserveStock(restaurantId: number, items: { menuItemId: number; quantity: number }[]) {
    const validation = await this.validateItems(restaurantId, items);
    if (!validation.valid) {
      return { reserved: false, reservationId: '', error: validation.error };
    }

    for (const item of items) {
      await this.menuItemRepo.decrement({ id: item.menuItemId }, 'stock', item.quantity);
    }

    const reservationId = uuidv4();
    this.reservations.set(reservationId, { items, restaurantId, createdAt: new Date() });
    return { reserved: true, reservationId };
  }

  async releaseStock(reservationId: string) {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return { released: false };

    for (const item of reservation.items) {
      await this.menuItemRepo.increment({ id: item.menuItemId }, 'stock', item.quantity);
    }

    this.reservations.delete(reservationId);
    return { released: true };
  }
}
