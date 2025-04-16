// coupon.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export type DiscountType = 'percentage' | 'fixed';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: ['percentage', 'fixed'], default: 'fixed' })
  discountType: DiscountType;

  @Column('decimal')
  amount: number; // e.g. 10% or $10

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ default: true })
  isActive: boolean;
}