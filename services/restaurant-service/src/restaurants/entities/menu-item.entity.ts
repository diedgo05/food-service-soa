import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 50 })
  stock: number;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems)
  restaurant: Restaurant;

  @Column()
  restaurantId: number;
}
