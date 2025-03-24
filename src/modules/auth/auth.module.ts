import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
	imports: [
		UserModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || "krist-shop",
			signOptions: { expiresIn: "15m" },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService],
	exports: [AuthService, JwtModule],
})
export class AuthModule {}
