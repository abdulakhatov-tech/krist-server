import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { User } from "src/entities/user.entity";
import { UsersService } from "./users.service";

@Module({
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
