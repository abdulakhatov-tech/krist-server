import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity('sizes') 
export class Size {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 10 }) // S, M, L, XL
    name: string;

    @ManyToOne(() => Product, (product) => product.sizes, { onDelete: 'CASCADE' })
    product: Product;
}