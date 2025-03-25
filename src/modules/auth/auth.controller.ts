import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import {
	RefreshTokenDto,
	SignInUserDto,
	SignOutUserDto,
	SignUpUserDto,
} from "./dto";

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
	async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
		return this.authService.refreshToken(refreshTokenDto);
	}

	@Post("sign-out")
	async logout(@Body("userId") userId: SignOutUserDto) {
		return this.authService.signOut(userId);
	}
}
