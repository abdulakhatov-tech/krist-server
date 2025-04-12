import { Module } from '@nestjs/common';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from 'src/entities/wishlist.entity';
import { Product, User } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Wishlist, User])],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
