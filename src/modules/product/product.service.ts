import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Stock, User, Product, Category, Subcategory } from 'src/entities';
import { FindAllPropsType } from './product.interface';
import { ResponseType } from 'src/common/interfaces/general';
import { CreateProductDto, EditProductDto, EditStockDto } from './dto';

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
    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,
  ) {}

  async findAll({
    page = 1,
    limit = 24,
    minPrice,
    maxPrice,
    category,
    subcategory,
    search,
    startDate,
    endDate,
  }: FindAllPropsType): Promise<ResponseType<Product[]>> {
    try {
      await this.validatePagination(page, limit);

      // Validate date range if provided
      if (startDate && endDate && startDate > endDate) {
        throw new BadRequestException('Start date cannot be after end date');
      }

      const skip = (page - 1) * limit;

      // Start building query
      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.createdBy', 'user')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.subcategory', 'subcategory')
        .leftJoinAndSelect('product.stock', 'stock')
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
          'product.createdAt',
          'product.discount',
          'product.isBestSeller',
          'product.isFeatured',
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
          'stock.id', // ✅ Select stock fields too
          'stock.color',
          'stock.size',
          'stock.quantity',
        ])
        .where(this.buildPriceFilter(minPrice, maxPrice));

      // Apply category filter
      if (category) {
        queryBuilder.andWhere('category.slug = :categorySlug', {
          categorySlug: category,
        });
      }

      if (subcategory) {
        queryBuilder.andWhere('subcategory.slug = :subcategorySlug', {
          subcategorySlug: subcategory,
        });
      }

      // Apply search filter
      if (search) {
        queryBuilder.andWhere('product.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      // Apply date range filters
      if (startDate) {
        queryBuilder.andWhere('product.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('product.createdAt <= :endDate', { endDate });
      }

      // Pagination and sorting
      queryBuilder.orderBy('product.id', 'ASC').skip(skip).take(limit);

      const [products, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Products fetched successfully',
        data: products,
        pagination: {
          total,
          totalPages,
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

  async findAllProducts(): Promise<ResponseType<Product[]>> {
    try {
      const products = await this.productRepository.find();

      return {
        success: true,
        message: 'Products fetched successfully.',
        data: products,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to fetch products.',
      );
    }
  }

  async findById(id: string): Promise<ResponseType<Product>> {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['category', 'subcategory', 'createdBy', 'stock'],
      });

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

  async findBestSellers(): Promise<ResponseType<Product[]>> {
    try {
      const products = await this.productRepository.find({
        where: { isBestSeller: true },
        relations: ['category', 'subcategory', 'createdBy', 'stock'],
      });

      return {
        success: true,
        message: 'Best sellers fetched successfully.',
        data: products,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to fetch best sellers.',
      );
    }
  }

  async findNewArrivals(): Promise<ResponseType<Product[]>> {
    try {
      const products = await this.productRepository.find({
        order: { createdAt: 'DESC' },
        take: 10,
        relations: ['category', 'subcategory', 'createdBy', 'stock'],
      });

      return {
        success: true,
        message: 'New arrivals fetched successfully.',
        data: products,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to fetch new arrivals.',
      );
    }
  }

  async findFeatured(): Promise<ResponseType<Product[]>> {
    try {
      const products = await this.productRepository.find({
        where: { isFeatured: true },
        relations: ['category', 'subcategory', 'createdBy', 'stock'],
      });

      return {
        success: true,
        message: 'Featured products fetched successfully.',
        data: products,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to fetch featured products.',
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
    dto: Partial<EditProductDto>,
  ): Promise<ResponseType<Product>> {
    try {
      // Find the existing product
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['category', 'subcategory', 'createdBy', 'stock'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID "${id}" not found.`);
      }

      // If the slug is being updated, check for uniqueness
      if (dto.slug && dto.slug !== product.slug) {
        await this.checkForExistingProduct(dto.slug);
      }

      // Fetch related entities if provided in DTO
      const relatedEntities = await this.findReletedEntitiesEditMode(dto);

      const discount = Math.round(
        (((dto?.originalPrice ?? 0) - (dto?.currentPrice ?? 0)) /
          (dto?.originalPrice ?? 1)) *
          100,
      );

      // Apply updates only for fields provided in DTO
      Object.assign(product, {
        ...dto,
        category: relatedEntities.category || product.category,
        subcategory: relatedEntities.subcategory || product.subcategory,
        discount: discount,
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

  async deleteProduct(id: string): Promise<ResponseType> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Product not found!');
    }

    await this.productRepository.delete(id);

    return {
      success: true,
      message: 'Product deleted successfully.',
    };
  }

  async editStock(
    id: string,
    dto: EditStockDto[],
  ): Promise<ResponseType<Product>> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['stock'],
    });

    if (!product) {
      throw new NotFoundException('Product not found with this id');
    }

    // Delete existing stock
    await this.stockRepository.delete({ product: { id } });

    // Create new stock entries
    const newStockEntities = dto.map((item) => {
      return this.stockRepository.create({
        ...item,
        product, // associate with the existing product
      });
    });

    await this.stockRepository.save(newStockEntities);

    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['stock'],
    });

    return {
      success: true,
      message: 'Product stock updated',
      data: updatedProduct!,
    };
  }

  // Methods to improve code quality and maintainability
  private async validatePagination(page: number, limit: number) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0.');
    if (limit < 1)
      throw new BadRequestException('Limit must be greater than 0.');
  }

  private buildPriceFilter(minPrice?: number, maxPrice?: number) {
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
    const [category, subcategory, createdBy] = await Promise.all([
      this.categoryRepository.findOne({ where: { id: dto.category } }),
      this.subcategoryRepository.findOne({ where: { id: dto.subcategory } }),
      this.userRepository.findOne({
        where: { id: dto.createdBy },
        select: ['id', 'firstName', 'lastName'],
      }),
    ]);

    return { category, subcategory, createdBy };
  }

  private async findReletedEntitiesEditMode(dto: Partial<EditProductDto>) {
    const [category, subcategory] = await Promise.all([
      this.categoryRepository.findOne({ where: { id: dto.category } }),
      this.subcategoryRepository.findOne({ where: { id: dto.subcategory } }),
    ]);

    return { category, subcategory };
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
    const { category, subcategory, createdBy, stock } = entities;

    if (!category || !subcategory || !createdBy) {
      throw new NotFoundException('Category, Subcategory, or User not found.');
    }

    const discount = Math.round(
      (((dto?.originalPrice ?? 0) - (dto?.currentPrice ?? 0)) /
        (dto?.originalPrice ?? 1)) *
        100,
    );

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
    product.stock = stock;
    product.discount = discount;

    return product;
  }
}
