import { IsEnum, IsNumber, IsString, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderProductDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];

  @IsEnum(['courier', 'pickup', 'postal'])
  delivery_method: 'courier' | 'pickup' | 'postal';

  @IsEnum(['payme', 'click', 'cash'])
  payment_method: 'payme' | 'click' | 'cash';

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  shipping: number = 0;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  coupon: number = 0;

  @IsString()
  region: string;

  @IsString()
  district: string;

  @IsString()
  extraAddress: string;
}
