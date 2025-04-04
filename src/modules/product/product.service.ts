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

      const [products, total] = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.createdBy', 'user')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.subcategory', 'subcategory')
        .select([
          'product.id',
          'product.name',
          'product.slug',
          'product.currentPrice',
          'product.originalPrice',
          'product.imageUrl',
          'product.imageUrls',
          'product.short_description',
          'product.description',
          'product.currentPrice',
          'product.originalPrice',
          'product.createdAt',
          'user.id',
          'user.firstName',
          'user.lastName',
          'user.role',
          'category.id',
          'category.name',
          'category.slug',
          'subcategory.id',
          'subcategory.name',
          'subcategory.slug',
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

  async findById(id: string): Promise<ResponseType<Product>> {
    try {
      const product = await this.productRepository.findOne({ where: { id }, relations: ['category', 'subcategory', 'createdBy'] });

      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      return {
        success: true,
        message: 'Product fetched successfully.',
        data: product,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to fetch product.',
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

  async editProduct(
    id: string,
    dto: Partial<CreateProductDto>
  ): Promise<ResponseType<Product>> {
    try {
      // Find the existing product
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['category', 'subcategory', 'createdBy', 'colors', 'sizes', 'stock'],
      });
  
      if (!product) {
        throw new NotFoundException(`Product with ID "${id}" not found.`);
      }
  
      // If the slug is being updated, check for uniqueness
      if (dto.slug && dto.slug !== product.slug) {
        await this.checkForExistingProduct(dto.slug);
      }
  
      // Fetch related entities if provided in DTO
      const relatedEntities = await this.findReletedEntities(dto);
  
      // Apply updates only for fields provided in DTO
      Object.assign(product, {
        ...dto,
        category: relatedEntities.category || product.category,
        subcategory: relatedEntities.subcategory || product.subcategory,
        createdBy: relatedEntities.createdBy || product.createdBy,
        colors: relatedEntities.colors.length ? relatedEntities.colors : product.colors,
        sizes: relatedEntities.sizes.length ? relatedEntities.sizes : product.sizes,
        stock: relatedEntities.stock.length ? relatedEntities.stock : product.stock,
      });
  
      // Save the updated product
      await this.productRepository.save(product);
  
      return {
        success: true,
        message: 'Product updated successfully.',
        data: product,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to update product.',
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

    const isValidMinPrice = typeof minPrice === 'number' && !isNaN(minPrice);
    const isValidMaxPrice = typeof maxPrice === 'number' && !isNaN(maxPrice);

    if (isValidMinPrice && isValidMaxPrice) {
      if (minPrice > maxPrice) {
        throw new BadRequestException(
          'minPrice cannot be greater than maxPrice.',
        );
      }
      where.currentPrice = Between(minPrice, maxPrice);
    } else if (isValidMinPrice) {
      where.currentPrice = Between(minPrice, Number.MAX_SAFE_INTEGER);
    } else if (isValidMaxPrice) {
      where.currentPrice = Between(0, maxPrice);
    }

    return Object.keys(where).length ? where : {};
  }

  private async findReletedEntities(dto: Partial<CreateProductDto>) {
    const [category, subcategory, createdBy, colors, sizes, stock] =
      await Promise.all([
        this.categoryRepository.findOne({ where: { id: dto.category } }),
        this.subcategoryRepository.findOne({ where: { id: dto.subcategory } }),
        this.userRepository.findOne({
          where: { id: dto.createdBy },
          select: ['id', 'firstName', 'lastName'],
        }),
        dto.colors?.length ? this.colorRepository.findBy({ id: In(dto.colors) }) : [],
        dto.sizes?.length ? this.sizeRepository.findBy({ id: In(dto.sizes) }) : [],
        dto.stock?.length ? this.stockRepository.findBy({ id: In(dto.stock) }) : [],
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
