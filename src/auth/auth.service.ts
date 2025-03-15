import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { Repository } from "typeorm";

import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import type { UsersService } from "src/users/users.service";
import type { SignInUserDto } from "./dto/sign-in-user.dto";
import type { SignUpUserDto } from "./dto/sign-up-user.dto";
import type {
	AuthResponseType,
	GenerateTokensResponseType,
	LogoutResponseType,
	RefreshTokenResponseType,
} from "./interface";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

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

	async refreshToken(refreshToken: string): Promise<RefreshTokenResponseType> {
		// Validate the refresh token
		const payload = this.jwtService.verify(refreshToken);
		const user = await this.usersService.findOneById(payload.id);

		if (!user || user.refreshToken !== refreshToken) {
			throw new UnauthorizedException("Invalid refresh token!");
		}

		// Generate new tokens
		const { accessToken, refreshToken: newRefreshToken } =
			await this.generateToken(user);

		// Update the refresh token in the database
		await this.usersService.updateRefreshToken(user.id, newRefreshToken);

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

	async signUp(signUpUserDto: SignUpUserDto): Promise<AuthResponseType> {
		const { identifier } = signUpUserDto;

		if (!identifier || typeof identifier !== "string") {
			throw new BadRequestException("Invalid Identifier provided!");
		}

		const user = await this.usersService.createUser(signUpUserDto);

		const { accessToken, refreshToken } = await this.generateToken(user);

		await this.usersService.updateRefreshToken(user.id, refreshToken);

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

	async signIn(signInUserDto: SignInUserDto): Promise<AuthResponseType> {
		const { identifier, password, rememberMe } = signInUserDto;

		if (!identifier || typeof identifier !== "string") {
			throw new BadRequestException("Invalid Identifier provided!");
		}

		// Find user by identifier (email or phone number)
		const user = await this.usersService.findOneByIdentifier(identifier);

		if (!user) {
			throw new UnauthorizedException("Invalid credentials!");
		}

		// Validate password
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid credentials!");
		}

		// Generate tokens
		const { accessToken, refreshToken } = await this.generateToken(
			user,
			rememberMe,
		);

		// Update refresh token in the database
		await this.usersService.updateRefreshToken(user.id, refreshToken);

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

	async logout(userId: string): Promise<LogoutResponseType> {
		const user = await this.userRepository.findOne({ where: { id: userId } });

		if (!user) throw new NotFoundException("User not found!");

		// Clear the refresh token in the user's record
		await this.userRepository.update(userId, { refreshToken: null });

		return {
			success: true,
			message: "You have logged out successfully!",
		};
	}
}
