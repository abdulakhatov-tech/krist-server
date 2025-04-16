import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { OrderProduct } from './order-product.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order, {
    cascade: true,
    eager: true,
  })
  products: OrderProduct[];
  @Column({ type: 'enum', enum: ['courier', 'pickup', 'postal'] })
  delivery_method: 'courier' | 'pickup' | 'postal';

  @Column({ type: 'enum', enum: ['payme', 'click', 'cash'] })
  payment_method: 'payme' | 'click' | 'cash';

  @Column({ type: 'varchar', length: 255 })
  region: string;

  @Column({ type: 'varchar', length: 255 })
  district: string;

  @Column({ type: 'varchar', length: 255 })
  extraAddress: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'delivered', 'canceled'],
    default: 'pending',
  })
  status: 'pending' | 'processing' | 'delivered' | 'canceled';

  @Column({ type: 'decimal', default: 0 })
  price: number;

  @Column({ type: 'decimal', default: 0 })
  shipping: number;

  @Column({ type: 'decimal', default: 0 })
  coupon: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
