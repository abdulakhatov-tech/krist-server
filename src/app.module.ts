import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { typeOrmConfig } from "./config/typeorm.config";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { CategoryModule } from './modules/category/category.module';
import { SubcategoryModule } from './modules/subcategory/subcategory.module';
import { UploadModule } from './modules/upload/upload.module';
import { ProductModule } from './modules/product/product.module';
import { SizeModule } from './modules/size/size.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot(typeOrmConfig),
		AuthModule,
		UserModule,
		CategoryModule,
		SubcategoryModule,
		UploadModule,
		ProductModule,
		SizeModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
