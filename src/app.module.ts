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
import { SubscribeModule } from './modules/subscribe/subscribe.module';
import { BannersModule } from './modules/banners/banners.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { OrderModule } from './modules/order/order.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { ContactModule } from './modules/contact/contact.module';

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
		SubscribeModule,
		BannersModule,
		WishlistModule,
		CartModule,
		CouponModule,
		OrderModule,
		StripeModule,
		ContactModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
