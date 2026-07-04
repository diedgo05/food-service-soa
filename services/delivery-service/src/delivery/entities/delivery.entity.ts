import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column()
  deliveryPersonId: number;

  @Column({ type: 'varchar', default: DeliveryStatus.ASSIGNED })
  status: string;

  @CreateDateColumn()
  assignedAt: Date;
}
