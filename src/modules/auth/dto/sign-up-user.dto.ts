import { IsNotEmpty, IsString, Length } from "class-validator";

export class SignUpUserDto {
	@IsNotEmpty()
	@IsString()
	@Length(2, 30)
	firstName: string;

	@IsNotEmpty()
	@IsString()
	@Length(2, 30)
	lastName: string;

	@IsNotEmpty()
	@IsString()
	identifier: string;

	@IsNotEmpty()
	@IsString()
	@Length(5, 30)
	password: string;
}
