import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateSubCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug can only contain lowercase letters, numbers, and hyphens (e.g., "mens-fashion")',
  })
  slug: string;

  @IsString()
  @IsOptional()
  @Length(2, 255)
  image_url?: string;

  @IsString()
  @IsOptional()
  category: string;
}
