import { User } from "src/entities/user.entity";

export interface GenerateTokensResponseType {
	accessToken: string;
	refreshToken: string;
}

export interface AuthResponseType {
	success: boolean;
	message: string;
	data: {
		accessToken: string;
		refreshToken: string;
		user: User;
	};
}

export interface RefreshTokenResponseType {
	success: boolean;
	message: string;
	data: {
		accessToken: string;
		refreshToken?: string;
		expiresIn: number;
	};
}

export interface SignOutResponseType {
	success: boolean;
	message: string;
}
