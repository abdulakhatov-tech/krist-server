import { IsNotEmpty, IsString, Length } from "class-validator";

export class RefreshTokenDto {
	@IsNotEmpty()
	@IsString()
	refreshToken: string;
}
