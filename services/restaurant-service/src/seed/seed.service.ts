import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../restaurants/entities/menu-item.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Restaurant) private restaurantRepo: Repository<Restaurant>,
    @InjectRepository(MenuItem) private menuItemRepo: Repository<MenuItem>,
  ) {}

  async onModuleInit() {
    const count = await this.restaurantRepo.count();
    if (count > 0) return;

    const r1 = await this.restaurantRepo.save({
      name: 'Taquería El Fogón',
      address: 'Av. Insurgentes 450, Tuxtla Gutiérrez',
      isActive: true,
    });
    const r2 = await this.restaurantRepo.save({
      name: 'Cocina Doña Mari',
      address: 'Calle Real de Guadalupe 12, San Cristóbal',
      isActive: true,
    });
    const r3 = await this.restaurantRepo.save({
      name: 'Sushi Chiapas Express',
      address: 'Blvd. Belisario Domínguez 1820, Tuxtla Gutiérrez',
      isActive: true,
    });

    await this.menuItemRepo.save([
      { name: 'Tacos de cochito', price: 45, stock: 100, restaurantId: r1.id },
      { name: 'Quesadilla de chicharrón', price: 35, stock: 80, restaurantId: r1.id },
      { name: 'Pozol blanco', price: 25, stock: 60, restaurantId: r1.id },
      { name: 'Tamales de chipilín', price: 20, stock: 50, restaurantId: r1.id },

      { name: 'Sopa de pan', price: 55, stock: 40, restaurantId: r2.id },
      { name: 'Cochito horneado', price: 85, stock: 30, restaurantId: r2.id },
      { name: 'Tasajo con frijol', price: 70, stock: 35, restaurantId: r2.id },
      { name: 'Agua de tascalate', price: 30, stock: 60, restaurantId: r2.id },

      { name: 'Roll Chiapaneco', price: 120, stock: 25, restaurantId: r3.id },
      { name: 'Nigiri de atún', price: 95, stock: 30, restaurantId: r3.id },
      { name: 'Ramen de res', price: 110, stock: 20, restaurantId: r3.id },
    ]);

    console.log('Seed data inserted: 3 restaurants, 11 menu items');
  }
}
