import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import type { User } from "src/entities";
import type { UserService } from "../user/user.service";
import type {
	AuthResponseType,
	GenerateTokensResponseType,
	RefreshTokenResponseType,
	SignOutResponseType,
} from "./auth.interface";
import type {
	RefreshTokenDto,
	SignInUserDto,
	SignOutUserDto,
	SignUpUserDto,
} from "./dto";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	async signUp(body: SignUpUserDto): Promise<AuthResponseType> {
		const { identifier } = body;

		if (!identifier || typeof identifier !== "string") {
			throw new BadRequestException("Invalid Identifier provided!");
		}

		const user = await this.userService.createUser(body);

		const { accessToken, refreshToken } = await this.generateToken(user);

		await this.userService.updateRefreshToken(user.id, refreshToken);

		return {
			success: true,
			message: "Signed up successfully",
			data: {
				accessToken,
				refreshToken,
				user,
			},
		};
	}

	async signIn(body: SignInUserDto): Promise<AuthResponseType> {
		const { identifier, password, rememberMe } = body;

		if (!identifier || typeof identifier !== "string") {
			throw new BadRequestException("Invalid Identifier provided!");
		}

		// Find user by identifier (email or phone number)
		const user = await this.userService.findOneByIdentifier(identifier);

		if (!user) {
			throw new UnauthorizedException("Invalid credentials!");
		}

		// Validate password
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid password!");
		}

		// Generate tokens
		const { accessToken, refreshToken } = await this.generateToken(
			user,
			rememberMe,
		);

		// Update refresh token in the database
		await this.userService.updateRefreshToken(user.id, refreshToken);

		return {
			success: true,
			message: "Signed in successfully",
			data: {
				accessToken,
				refreshToken,
				user,
			},
		};
	}

	async signOut(body: SignOutUserDto): Promise<SignOutResponseType> {
		const { userId } = body;

		const user = await this.userService.findOneById(userId);
		if (!user) throw new NotFoundException("User not found!");

		// Clear the refresh token in the user's record
		await this.userService.clearRefreshToken(userId);

		return {
			success: true,
			message: "You have logged out successfully!",
		};
	}

	async refreshToken(body: RefreshTokenDto): Promise<RefreshTokenResponseType> {
		const { refreshToken } = body;

		// Validate the refresh token
		const payload = this.jwtService.verify(refreshToken);
		const user = await this.userService.findOneById(payload.id);

		if (!user || user.refreshToken !== refreshToken) {
			throw new UnauthorizedException("Invalid refresh token!");
		}

		// Generate new tokens
		const { accessToken, refreshToken: newRefreshToken } =
			await this.generateToken(user);

		// Update the refresh token in the database
		await this.userService.updateRefreshToken(user.id, newRefreshToken);

		return {
			success: true,
			message: "Tokens refreshed successfully",
			data: {
				accessToken,
				refreshToken: newRefreshToken, // Optional: Only include if rotating refresh tokens
				expiresIn: 900, // 15 minutes in seconds
			},
		};
	}

	async generateToken(
		user: User,
		rememberMe?: boolean,
	): Promise<GenerateTokensResponseType> {
		const payload = { id: user.id, role: user.role };

		const accessTokenExpiresIn = rememberMe ? "7d" : "15m";
		const refreshTokenExpiresIn = rememberMe ? "30d" : "7d";

		const accessToken = this.jwtService.sign(payload, {
			expiresIn: accessTokenExpiresIn,
		});
		const refreshToken = this.jwtService.sign(payload, {
			expiresIn: refreshTokenExpiresIn,
		});

		return { accessToken, refreshToken };
	}
}
