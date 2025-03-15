import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SignInUserDto {
	@IsString()
	@IsNotEmpty()
	identifier?: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsOptional()
	@IsBoolean()
	rememberMe?: boolean;
}
