import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from 'src/entities';
import { UserService } from '../user/user.service';
import {
  AuthResponseType,
  ForgotPasswordResponseType,
  GenerateTokensResponseType,
  RefreshTokenResponseType,
  SignOutResponseType,
  VerifyOtpResponseType,
} from './auth.interface';
import {
  ForgotPasswordDto,
  RefreshTokenDto,
  SignInUserDto,
  SignOutUserDto,
  SignUpUserDto,
  VerifyOtpDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(body: SignUpUserDto): Promise<AuthResponseType> {
    const { identifier } = body;

    if (!identifier || typeof identifier !== 'string') {
      throw new BadRequestException('Invalid Identifier provided!');
    }

    const user = await this.userService.createUser(body);

    const { accessToken, refreshToken } = await this.generateToken(user);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      success: true,
      message: 'Signed up successfully',
      data: {
        accessToken,
        refreshToken,
        user,
      },
    };
  }

  async signIn(body: SignInUserDto): Promise<AuthResponseType> {
    const { identifier, password, rememberMe } = body;

    if (!identifier || typeof identifier !== 'string') {
      throw new BadRequestException('Invalid Identifier provided!');
    }

    // Find user by identifier (email or phone number)
    const user = await this.userService.findOneByIdentifier(identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password!');
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
      message: 'Signed in successfully',
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
    if (!user) throw new NotFoundException('User not found!');

    // Clear the refresh token in the user's record
    await this.userService.clearRefreshToken(userId);

    return {
      success: true,
      message: 'You have logged out successfully!',
    };
  }

  async refreshToken(body: RefreshTokenDto): Promise<RefreshTokenResponseType> {
    const { refreshToken } = body;

    // Validate the refresh token
    const payload = this.jwtService.verify(refreshToken);
    const user = await this.userService.findOneById(payload.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token!');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateToken(user);

    // Update the refresh token in the database
    await this.userService.updateRefreshToken(user.id, newRefreshToken);

    return {
      success: true,
      message: 'Tokens refreshed successfully',
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

    const accessTokenExpiresIn = rememberMe ? '7d' : '15m';
    const refreshTokenExpiresIn = rememberMe ? '30d' : '7d';

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessTokenExpiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  async forgotPassword(
    body: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseType> {
    const { identifier } = body;

    if (!identifier) {
      throw new BadRequestException('Identifier is required.');
    }

    const user = await this.userService.findOneByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException('User not found!');
    }

    // Generate OTP and expiry time
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = Date.now() + 2 * 60 * 1000; // OTP expires in 2 minutes (timestamp in ms)

    // Save OTP in the database
	await this.userService.saveOtp(user.id, otpCode, expiresIn);

    return { 
		success: true,
		message: "OTP code sent to you!",
		data: {
			otpCode, 
			expiresIn
		}
	 };
  }

  async verifyOtp(body: VerifyOtpDto): Promise<VerifyOtpResponseType> {
    const { identifier, otpCode } = body;

    // Find user by email or phone
    const user = await this.userService.findOneByIdentifier(identifier);

    if(!user) {
      throw new NotFoundException('User not found!');
    }

    // Check if OTP exists and is still valid
    if(!user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('OTP not found or expired!');
    }

    const currentTime = new Date().getTime();
    const expiresAtTime = new Date(user.otpExpiresAt).getTime()
    if(currentTime > expiresAtTime) {
      throw new BadRequestException('OTP has expired!');
    }

    // Compare OTP codes
    if(user.otpCode !== otpCode) {
      throw new BadRequestException('Invalid OTP code!');
    }

    // Clear OTP from database after successful verification
    await this.userService.saveOtp(user.id, null, null);

    return {
      success: true, 
      message: "OTP verified successfully! You can reset your password."
    }
  }
}
