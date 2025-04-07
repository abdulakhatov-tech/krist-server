import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { UpdateCategoryDto } from './dto';
import { Subcategory } from 'src/entities';
import { Category } from 'src/entities/category.entity';
import { ResponseType } from 'src/common/interfaces/general';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindAllPropsType } from './category.interface';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<ResponseType<Category[]>> {
    const categories = await this.categoryRepository.find({
      relations: ['subcategories'],
    });

    return {
      success: true,
      message: 'Categories fetched successfully.',
      data: categories,
    };
  }

  async findAllWithPagination({
    page = 1,
    limit = 24,
    search,
  }: FindAllPropsType): Promise<ResponseType<Category[]>> {
    try {
      await this.validatePagination(page, limit);

      const skip = (page - 1) * limit;

      const queryBuilder = this.categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.subcategories', 'subcategory') 
        .leftJoinAndSelect('category.products', 'product') 
        .orderBy('category.id', 'ASC') // Ensure sorting is consistent
        .skip(skip)
        .take(limit);

      // Apply search filter
      if (search) {
        queryBuilder.andWhere('category.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      // Pagination and sorting
      queryBuilder.orderBy('category.id', 'ASC').skip(skip).take(limit);

      const [categories, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Categories fetched successfully',
        data: categories,
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
        error?.message || 'Error while fetching categories',
      );
    }
  }

  async findById(id: string): Promise<ResponseType<Category>> {
    const category = await this.findCategoryOrFail(id);

    return {
      success: true,
      message: 'Category found successfully.',
      data: category,
    };
  }

  async findSubCategoriesByCategorySlug(
    slug: string,
  ): Promise<ResponseType<Subcategory[]>> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['subcategories'],
    });

    if (!category) {
      throw new NotFoundException(`Category not found.`);
    }

    return {
      success: true,
      message: 'Subcategories fetched successfully.',
      data: category.subcategories,
    };
  }

  async findSubCategoriesByCategoryId(
    id: string,
  ): Promise<ResponseType<Subcategory[]>> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['subcategories'],
    });

    if (!category) {
      throw new NotFoundException(`Category not found.`);
    }

    return {
      success: true,
      message: 'Subcategories fetched successfully.',
      data: category.subcategories,
    };
  }

  async createCategory(
    dto: CreateCategoryDto,
  ): Promise<ResponseType<Category>> {
    await this.ensureSlugDoesNotExist(dto.slug);

    const category = this.categoryRepository.create(dto);
    await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category created successfully.',
      data: category,
    };
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<ResponseType<Category>> {
    const category = await this.findCategoryOrFail(id);

    Object.assign(category, dto);
    const updatedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category updated successfully.',
      data: updatedCategory,
    };
  }

  async deleteCategory(id: string): Promise<ResponseType> {
    const category = await this.findCategoryOrFail(id);
    await this.categoryRepository.delete(category.id);

    return {
      success: true,
      message: 'Category deleted successfully.',
    };
  }

  // Methods to improve code quality and maintainability
  private async validatePagination(page: number, limit: number) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0.');
    if (limit < 1)
      throw new BadRequestException('Limit must be greater than 0.');
  }

  // Helper method to find a category by slug or throw NotFoundException
  private async findCategoryOrFail(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`Category not found.`);
    }

    return category;
  }

  // Helper method to ensure a category slug does not already exist
  private async ensureSlugDoesNotExist(slug: string): Promise<void> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with slug "${slug}" already exists.`,
      );
    }
  }
}
