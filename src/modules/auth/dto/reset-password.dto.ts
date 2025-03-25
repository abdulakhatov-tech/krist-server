import { IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsString()
    identifier: string;

    @IsNotEmpty()
    @IsString()
    newPassword: string;
}