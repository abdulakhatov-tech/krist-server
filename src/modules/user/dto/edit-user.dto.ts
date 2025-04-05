import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { UserRole } from "src/common/enums/user-role.enum";

export class EditUserDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 100)
    lastName: string;

    @IsString()
    @IsNotEmpty()
    @Length(5, 100)
    email: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

    @IsEnum(UserRole, { message: 'Role must be one of: ADMIN, SELLER, CUSTOMER' })
    role: UserRole;
}
