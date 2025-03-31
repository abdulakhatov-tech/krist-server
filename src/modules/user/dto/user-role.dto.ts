import { IsEnum } from "class-validator";
import { UserRole } from "src/common/enums/user-role.enum";

export class UserRoleDto {
    @IsEnum(UserRole, { message: 'Role must be one of: ADMIN, SELLER, CUSTOMER' })
    role: UserRole;
}
