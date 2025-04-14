import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class ApplyCouponDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 10)
    code: string;

    @IsNumber()
    @IsNotEmpty()
    subtotal: number;
}