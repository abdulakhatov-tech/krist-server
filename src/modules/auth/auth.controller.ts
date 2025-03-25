import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import {
	ForgotPasswordDto,
	RefreshTokenDto,
	SignInUserDto,
	SignOutUserDto,
	SignUpUserDto,
	VerifyOtpDto,
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
	async signOut(@Body("userId") userId: SignOutUserDto) {
		return this.authService.signOut(userId);
	}

	@Post('forgot-password')
	async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		return this.authService.forgotPassword(forgotPasswordDto)
	}

	@Post('verify-otp')
	async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
		return this.authService.verifyOtp(verifyOtpDto);
	}
}
