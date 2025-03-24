import { IsNotEmpty, IsString, Length } from "class-validator";

export class SignOutUserDto {
	@IsNotEmpty()
	@IsString()
	userId: string;
}
