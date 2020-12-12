import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../orderStatus';

@Entity('orders')
export class Order {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  userId: string;

  @Column()
  status: OrderStatus;

  @Column()
  amount: number;
}
