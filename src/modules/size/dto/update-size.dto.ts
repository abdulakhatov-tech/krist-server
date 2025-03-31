import {
  IsNotEmpty,
  IsString,
  Length,

} from 'class-validator';

export class UpdateSizeDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;
}
