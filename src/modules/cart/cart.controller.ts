import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@Body() dto: AddToCartDto) {
    return this.cartService.addToCart(dto);
  }

  @Patch('/increment-quantity')
  incrementQuantity(@Body() dto: AddToCartDto) {
    return this.cartService.incrementQuantity(dto);
  }

  @Patch('/decrement-quantity')
  decrementQuantity(@Body() dto: AddToCartDto) {
    return this.cartService.decrementQuantity(dto);
  }

  @Delete('/:userId/:productId')
  removeFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  @Get('/:userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Delete('/:userId')
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
