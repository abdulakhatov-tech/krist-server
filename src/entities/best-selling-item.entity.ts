import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BestSellingCollection } from './best-selling-collection.entity';
import { Product } from './product.entity';

@Entity('best_selling_item')
export class BestSellingItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Index()
  @ManyToOne(() => BestSellingCollection, (collection) => collection.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: BestSellingCollection;

  // @Index()
  @ManyToOne(() => Product, (product) => product.bestSellingItems, {
    onDelete: 'CASCADE', // Ensures items are removed when the collection is deleted
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;
}
