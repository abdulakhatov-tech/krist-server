import {
  Index,
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Subcategory } from './subcategory.entity';
import { FlashSaleItem } from './flash-sale-item.entity';
import { Category } from './category.entity';
import { BestSellingItem } from './best-selling-item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 10000, nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'current_price' })
  currentPrice: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'original_price',
    nullable: true,
  })
  originalPrice?: number;

  @Column('decimal', { precision: 2, scale: 1, nullable: true })
  rating?: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'image_url' })
  imageUrl?: string;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory?: Subcategory;

  @Column({ type: 'boolean', default: false, name: 'is_best_seller' })
  isBestSeller: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  isFeatured: boolean;

  @OneToMany(() => FlashSaleItem, (fleshSaleItem) => fleshSaleItem.product)
  flashSaleItems: FlashSaleItem[];

  @OneToMany(
    () => BestSellingItem,
    (bestSellingItem) => bestSellingItem.product,
  )
  bestSellingItems: BestSellingItem[];

  @ManyToOne(() => User, (user: User) => user.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  @Index()
  createdBy?: User;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
