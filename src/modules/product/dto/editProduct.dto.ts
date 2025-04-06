import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class EditProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug can only contain lowercase letters, numbers, and hyphens (e.g., "mens-fashion")',
  })
  slug: string;

  
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  short_description: string;

  @IsString()
  @IsOptional()
  @Length(2, 1000)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  currentPrice: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  originalPrice?: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  imageUrl: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  imageUrls: string[];

  @IsUUID()
  category: string;

  @IsUUID()
  subcategory: string;

  @IsBoolean()
  @IsOptional()
  isBestSeller?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
