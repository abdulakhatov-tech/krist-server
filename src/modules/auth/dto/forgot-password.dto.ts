import { IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsString()
    identifier: string;
}