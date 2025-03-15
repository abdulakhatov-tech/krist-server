import { IsNotEmpty, IsString, Length } from "class-validator";

export class SignUpUserDto {
	@IsString()
	@IsNotEmpty()
	@Length(2, 50)
	firstName: string;

	@IsString()
	@IsNotEmpty()
	@Length(2, 50)
	lastName: string;

	@IsString()
	@IsNotEmpty()
	identifier: string;

	@IsString()
	@IsNotEmpty()
	@Length(5, 50)
	password: string;
}
