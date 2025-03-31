import {
  IsNotEmpty,
  IsString,
  Length,

} from 'class-validator';

export class CreateSizeDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;
}
