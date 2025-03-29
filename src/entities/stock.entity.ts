import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { Color } from './color.entity';
import { Size } from './size.entity';

@Entity()
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.stock, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => Color, { nullable: true, onDelete: 'CASCADE' })
  color?: Color;

  @ManyToOne(() => Size, { nullable: true, onDelete: 'CASCADE' })
  size?: Size;

  @Column({ type: 'int', default: 0 })
  quantity: number;
}
