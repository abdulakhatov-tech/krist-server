import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';


export class EditUserProfileInfoDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  extraAddress: string;

  @IsString()
  @IsNotEmpty()
  profilePhoto: string;

  @IsString()
  @IsOptional()
  password: string;
 
  @IsString()
  @IsOptional()
  newPassword: string;
}
