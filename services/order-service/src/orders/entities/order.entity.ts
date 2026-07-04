import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurantId: number;

  @Column('jsonb')
  items: { menuItemId: number; quantity: number; name?: string; unitPrice?: number }[];

  @Column({ type: 'varchar', default: OrderStatus.PENDING })
  status: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ nullable: true })
  deliveryPersonId: number;

  @Column({ nullable: true })
  deliveryId: number;

  @Column({ nullable: true })
  reservationId: string;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  deliveryAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
