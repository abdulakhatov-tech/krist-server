import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Between, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  Size,
  Stock,
  User,
  Color,
  Product,
  Category,
  Subcategory,
} from 'src/entities';
import { CreateProductDto } from './dto';
import { FindAllPropsType } from './product.interface';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  async findAll({
    page = 1,
    limit = 24,
    minPrice,
    maxPrice,
  }: FindAllPropsType): Promise<ResponseType<Product[]>> {
    try {
      await this.validatePagination(page, limit);

      const skip = (page - 1) * limit;
      const where = this.buildPriceFilder(minPrice, maxPrice);

      // Fixing: Use SQL comparison operators directly for TypeORM
      // const [products, total] = await this.productRepository.findAndCount({
      //   skip,
      //   take: limit,
      //   where,
      //   relations: ['createdBy'],
      //   order: { id: 'ASC' },
      // });

      const [products, total] = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.createdBy', 'user') 
        .leftJoinAndSelect('product.category', 'category') 
        .leftJoinAndSelect('product.subcategory', 'subcategory') 
        .select([
          'product.id',
          'product.name',
          'product.currentPrice',
          'product.originalPrice',
          'product.imageUrl',
          'product.imageUrls',
          'product.short_description',
          'product.description',
          'product.currentPrice',
          'product.originalPrice',
          'user.id',
          'user.firstName',
          'user.lastName',
          'category.id',
          'category.name',
          'category.slug',
          'subcategory.id',
          'subcategory.name',
          'subcategory.slug'
        ])
        .where(where)
        .orderBy('product.id', 'ASC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

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
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Error while fetching products',
      );
    }
  }

  async createProduct(dto: CreateProductDto): Promise<ResponseType<Product>> {
    try {
      await this.checkForExistingProduct(dto.slug);

      const relatedEntities = await this.findReletedEntities(dto);

      const product = this.createProductEntity(dto, relatedEntities);

      await this.productRepository.save(product);

      return {
        success: true,
        message: 'Product created successfully.',
        data: product,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to create product.',
      );
    }
  }

  // Methods to improve code quality and maintainability
  private async validatePagination(page: number, limit: number) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0.');
    if (limit < 1)
      throw new BadRequestException('Limit must be greater than 0.');
  }

  private buildPriceFilder(minPrice?: number, maxPrice?: number) {
    const where: any = {};

    if (minPrice !== undefined && maxPrice !== undefined) {
      if (minPrice > maxPrice) {
        throw new BadRequestException(
          'minPrice cannot be greater than maxPrice.',
        );
      }
      where.currentPrice = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.currentPrice = Between(minPrice, Number.MAX_SAFE_INTEGER);
    } else if (maxPrice !== undefined) {
      where.currentPrice = Between(0, maxPrice);
    }

    return where;
  }

  private async findReletedEntities(dto: CreateProductDto) {
    const [category, subcategory, createdBy, colors, sizes, stock] =
      await Promise.all([
        this.categoryRepository.findOne({ where: { id: dto.category } }),
        this.subcategoryRepository.findOne({ where: { id: dto.subcategory } }),
        this.userRepository.findOne({
          where: { id: dto.createdBy },
          select: ['id', 'firstName', 'lastName'],
        }),
        this.colorRepository.findBy({ id: In(dto.colors) }),
        this.sizeRepository.findBy({ id: In(dto.sizes) }),
        this.stockRepository.findBy({ id: In(dto.stock) }),
      ]);

    return { category, subcategory, createdBy, colors, sizes, stock };
  }

  private async checkForExistingProduct(slug: string) {
    const existingProduct = await this.productRepository.findOne({
      where: { slug },
    });
    if (existingProduct) {
      throw new BadRequestException(
        `Product with slug "${slug}" already exists.`,
      );
    }
  }

  private createProductEntity(dto: CreateProductDto, entities: any) {
    const { category, subcategory, createdBy, colors, sizes, stock } = entities;

    if (!category || !subcategory || !createdBy) {
      throw new NotFoundException('Category, Subcategory, or User not found.');
    }

    const product = new Product();
    product.name = dto.name;
    product.slug = dto.slug;
    product.short_description = dto.short_description;
    product.description = dto.description || null;
    product.currentPrice = dto.currentPrice;
    product.originalPrice = dto.originalPrice || null;
    product.imageUrl = dto.imageUrl;
    product.imageUrls = dto.imageUrls;
    product.category = category;
    product.subcategory = subcategory;
    product.isBestSeller = dto.isBestSeller || false;
    product.isFeatured = dto.isFeatured || false;
    product.createdBy = createdBy;
    product.colors = colors;
    product.sizes = sizes;
    product.stock = stock;

    return product;
  }
}
