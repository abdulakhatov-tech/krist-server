import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, Product, User } from 'src/entities';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/cart.dto';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addToCart(dto: AddToCartDto): Promise<ResponseType<Cart>> {
    const { userId, productId } = dto;

    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const product = await this.productRepository.findOneByOrFail({
      id: productId,
    });

    const existing = await this.cartRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (existing) {
      existing.quantity += 1;
      const savedItem = await this.cartRepository.save(existing);

      return {
        success: true,
        message: 'Product quantity updated in cart!',
        data: savedItem,
      };
    }

    const quantity = 1;

    const newItem = this.cartRepository.create({ user, product, quantity });
    const savedItem = await this.cartRepository.save(newItem);

    return {
      success: true,
      message: 'Product has been added to cart!',
      data: savedItem,
    };
  }

  async incrementQuantity(dto: AddToCartDto): Promise<ResponseType<Cart>> {
    const { userId, productId } = dto;

    const item = await this.cartRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
      relations: ['user', 'product'], // optional, if needed
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    item.quantity += 1;

    const updatedItem = await this.cartRepository.save(item);

    return {
      success: true,
      message: 'Quantity incremented successfully',
      data: updatedItem,
    };
  }

  async decrementQuantity(dto: AddToCartDto): Promise<ResponseType<Cart>> {
    const { userId, productId } = dto;


    const item = await this.cartRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
      relations: ['user', 'product'], // optional, if needed
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    if (item.quantity <= 1) {
      // Optional: delete the item instead of allowing 0
      await this.cartRepository.remove(item);
      return {
        success: true,
        message: 'Item removed from cart',
        data: item,
      };
    }

    item.quantity -= 1;

    const updatedItem = await this.cartRepository.save(item);

    return {
      success: true,
      message: 'Quantity decremented successfully',
      data: updatedItem,
    };
  }

  async removeFromCart(
    userId: string,
    productId: string,
  ): Promise<ResponseType<Cart>> {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const product = await this.productRepository.findOneByOrFail({
      id: productId,
    });

    const cartItem = await this.cartRepository.findOneByOrFail({
      user: { id: user.id },
      product: { id: product.id },
    });

    await this.cartRepository.delete({ id: cartItem.id });

    return {
      success: true,
      message: 'Cart item has been removed from the cart!',
      data: cartItem,
    };
  }

  async getCart(userId: string): Promise<ResponseType<Cart[]>> {
    const cart = await this.cartRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['product'], // loads product details with each cart item
    });

    return {
      success: true,
      message: 'Cart items fetched successfully!',
      data: cart,
    };
  }

  async clearCart(userId: string): Promise<ResponseType<[]>> {
    // Delete all items in the cart for the user
    await this.cartRepository.delete({ user: { id: userId } });

    return {
      success: true,
      message: 'Cart has been cleared!',
      data: [],  // No data needs to be returned, just a success message
    };
  }
}
