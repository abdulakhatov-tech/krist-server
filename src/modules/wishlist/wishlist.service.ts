import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from 'src/entities/wishlist.entity';
import { Repository } from 'typeorm';
import { AddToWishlistDto } from './dto/addToWishlistDto';
import { Product, User } from 'src/entities';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addToWishlist(dto: AddToWishlistDto): Promise<ResponseType<Wishlist>> {
    const { userId, productId } = dto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found!');

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found!');

    const exists = await this.wishlistRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (exists) throw new ConflictException('Product is already in wishlist');

    const wishlist = this.wishlistRepository.create({ user, product });
    const savedWishlist = await this.wishlistRepository.save(wishlist);

    return {
      success: true,
      message: 'Product added to wishlist',
      data: savedWishlist,
    };
  }

  async getWishlist(userId: string): Promise<ResponseType<Wishlist[]>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found!');
  
    const wishlist = await this.wishlistRepository.find({
      where: { user: { id: userId } },
      relations: ['product'], // include product details
      order: { createdAt: 'DESC' }, // optional: latest first
    });
  
    return {
      success: true,
      message: 'User wishlist fetched successfully',
      data: wishlist,
    };
  }

  async removeFromWishlist(userId: string, productId: string): Promise<ResponseType<null>> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
  
    if (!wishlist) {
      throw new NotFoundException('Wishlist item not found');
    }
  
    await this.wishlistRepository.remove(wishlist);
  
    return {
      success: true,
      message: 'Product removed from wishlist',
      data: null,
    };
  }
  
}
