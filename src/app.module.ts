import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { User } from "./entities/user.entity";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot({
			type: "postgres",
			host: process.env.POSTGRES_HOST || "localhost",
			port: Number(process.env.POSTGRES_PORT) || 5432,
			username: process.env.POSTGRES_USERNAME || "postgres",
			password: process.env.POSTGRES_PASSWORD || "islom6975",
			database: process.env.POSTGRES_DATABASE || "krist-shop",
			entities: [User], // Ensure User entity is included
			synchronize: true, // Auto sync DB (disable in production)
		}),
		AuthModule,
		UsersModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
