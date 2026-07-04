import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('delivery_persons')
export class DeliveryPerson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  currentOrderId: number;
}
