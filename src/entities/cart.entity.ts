import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity()
@Unique(['user', 'product']) // prevent duplicates
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  quantity: number;

  @ManyToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, (product) => product.cartedBy, { onDelete: 'CASCADE' })
  product: Product;
}
