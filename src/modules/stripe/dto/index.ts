import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ProductDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsString()
  name: string;

  @IsString()
  imageUrl: string;
}

export class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  @IsNumber()
  @IsOptional()
  coupon?: number;

  @IsNumber()
  @IsOptional()
  shipping?: number;

  @IsString()
  @IsOptional()
  userId?: string;
}
