import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FlashSale } from './flash-sale.entity';
import { Product } from './product.entity';

@Entity('flash_sale_items')
export class FlashSaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => FlashSale, (flashSale) => flashSale.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'flash_sale_id' })
  flashSale: FlashSale;

  @ManyToOne(() => Product, (product) => product.flashSaleItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', name: 'discount_percentage' })
  discountPercentage: number;

  @Column({ type: 'int', name: 'display_order', default: 0 })
  displayOrder: number;
}
