import { Body, Controller, Post } from "@nestjs/common";

import type { AuthService } from "./auth.service";
import type { SignInUserDto } from "./dto/sign-in-user.dto";
import type { SignUpUserDto } from "./dto/sign-up-user.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("sign-up")
	async signUp(@Body() signUpUserDto: SignUpUserDto) {
		return this.authService.signUp(signUpUserDto);
	}

	@Post("sign-in")
	async signIn(@Body() signInUserDto: SignInUserDto) {
		return this.authService.signIn(signInUserDto);
	}

	@Post("refresh-token")
	async refreshToken(@Body() refreshTokenDto: string) {
		return this.authService.refreshToken(refreshTokenDto);
	}

	// @Post("sign-out")
	// async logout(@Body("userId") userId: string) {
	// 	return this.authService.logout(userId);
	// }
}
