import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export enum DeliverMethod {
  COURIER = 'courier',
  PICKUP = 'pickup',
  POSTAL = 'postal',
}

export enum PaymentMethod {
  CASH = 'cash',
  PAYME = 'payme',
  CLICK = 'click',
}

export class EditUserOrderInfoDto {
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
}
