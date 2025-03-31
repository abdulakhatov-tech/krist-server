import { UserRole } from 'src/common/enums/user-role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  firstName: string;

  @Column({ type: 'varchar', length: 50 })
  lastName: string;

  @Index()
  @Column({ type: 'varchar', unique: true, nullable: true, length: 50 })
  email?: string | null;

  @Index()
  @Column({ type: 'varchar', unique: true, nullable: true, length: 20 })
  phoneNumber?: string | null;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  profilePhoto?: string | null;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  region?: string | null;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  district?: string | null;

  @Column({ type: 'varchar', nullable: true, length: 200 })
  extraAddress?: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshToken?: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  otpCode?: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  otpExpiresAt?: Date | null;

  @OneToMany(() => Product, (product) => product.createdBy)
  products: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
