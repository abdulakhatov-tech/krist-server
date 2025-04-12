import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/addToWishlistDto';

@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) {}

    @Post()
    async addToWishlist(@Body() dto: AddToWishlistDto) {
        return this.wishlistService.addToWishlist(dto);
    }

    @Delete('/:userId/:productId')
    async removeFromWishlist(@Param('userId') userId: string, @Param('productId') productId: string) {
        return this.wishlistService.removeFromWishlist(userId, productId);
    }

    @Get('/:userId')
    async getWishlist(@Param('userId') userId: string) {
        return this.wishlistService.getWishlist(userId)
    }
}
