import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class EditStockDto {
  @IsString()
  @IsNotEmpty()
  color: string;

  @IsEnum(['s', 'm', 'l', 'xl', 'xxl'])
  size: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  stock: number;
}
