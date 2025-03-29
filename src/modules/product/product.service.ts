import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { Product } from 'src/entities';
import { FindAllPropsType } from './product.interface';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll({
    page = 1,
    limit = 24,
    minPrice,
    maxPrice,
  }: FindAllPropsType): Promise<ResponseType<Product[]>> {
    const skip = (page - 1) * limit;

    // Validate inputs
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1)
      throw new BadRequestException('Limit must be greater than 0');

    // Dynamic filter conditions
    const where: any = {};
    
    if (minPrice !== undefined && maxPrice !== undefined) {
      if (minPrice > maxPrice) {
        throw new BadRequestException('minPrice cannot be greater than maxPrice');
      }
      where.currentPrice = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.currentPrice = Between(minPrice, Number.MAX_SAFE_INTEGER);
    } else if (maxPrice !== undefined) {
      where.currentPrice = Between(0, maxPrice);
    }

    // Fixing: Use SQL comparison operators directly for TypeORM
    const [products, total] = await this.productRepository.findAndCount({
      skip,
      take: limit,
      where,
      order: { id: 'ASC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Products fetched successfully',
      data: products,
      pagination: {
        total, // Total records
        totalPages, // Total pages
        currentPage: page,
        perPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
