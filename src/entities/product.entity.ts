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
import { Stock } from './stock.entity';
import { Banner } from './banner.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 200 })
  short_description: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 60, unique: true })
  slug: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'current_price' })
  currentPrice: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'original_price',
    nullable: true,
  })
  originalPrice?: number | null;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'varchar', length: 255, name: 'image_url' })
  imageUrl: string;

  @Column('text', { array: true, name: 'image_urls' })
  imageUrls: string[];

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

  @Column({ type: 'float', default: 0 })
  discount: number;

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

  @OneToMany(() => Stock, (stock) => stock.product)
  stock: Stock[];

  @OneToMany(() => Banner, (banner) => banner.product)
  banners: Banner[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
