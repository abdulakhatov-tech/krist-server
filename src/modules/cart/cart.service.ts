import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart, Product, User } from 'src/entities';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/cart.dto';

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

  async addToCart(dto: AddToCartDto) {
    const { userId, productId, quantity } = dto;

    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const product = await this.productRepository.findOneByOrFail({ id: productId });

    const existing = await this.cartRepository.findOne({
      where: { user, product },
    });

    if (existing) {
      existing.quantity += quantity;
      return this.cartRepository.save(existing);
    }

    const newItem = this.cartRepository.create({ user, product, quantity });
    return this.cartRepository.save(newItem);
  }

  async updateQuantity(dto: AddToCartDto) {
    const { userId, productId, quantity } = dto;

    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const product = await this.productRepository.findOneByOrFail({ id: productId });

    const item = await this.cartRepository.findOneOrFail({ where: { user, product } });

    item.quantity = quantity;
    return this.cartRepository.save(item);
  }

  async removeFromCart(userId: string, productId: string) {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const product = await this.productRepository.findOneByOrFail({ id: productId });

    return this.cartRepository.delete({ user, product });
  }

  async getCart(userId: string) {
    const user = await this.userRepository.findOneByOrFail({ id: userId });

    return this.cartRepository.find({
      where: { user },
      relations: ['product'], // if you want product details
    });
  }
}
