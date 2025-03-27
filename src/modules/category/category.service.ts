import { Repository } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Category } from 'src/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CreateCategoryResponseType,
  DeleteCategoryResponseType,
  FindAllCategoryResponseType,
} from './category.interface';
import { UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<FindAllCategoryResponseType> {
    try {
      const categories = await this.categoryRepository.find({
        relations: ['subcategories'],
        order: { name: 'ASC', subcategories: { name: 'ASC' } },
      });

      if (!categories) {
        throw new NotFoundException(
          'Something went wrong while fetching categories.',
        );
      }

      return {
        success: true,
        message: 'ok',
        data: categories,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch categories: ${error.message}`,
      );
    }
  }

  async createCategory(
    dto: CreateCategoryDto,
  ): Promise<CreateCategoryResponseType> {
    const { slug } = dto;

    const existingCategory = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with slug "${slug}" already exists.`,
      );
    }

    const category = this.categoryRepository.create(dto);
    await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category created successfully.',
      data: category,
    };
  }

  async updateCategory(
    slug: string,
    dto: UpdateCategoryDto,
  ): Promise<CreateCategoryResponseType> {
    const category = await this.categoryRepository.findOne({ where: { slug } });

    if (!category) {
      throw new NotFoundException(`Category with Slug "${slug}" not found`);
    }

    Object.assign(category, dto);

    const updatedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      message: 'Category updated successfully.',
      data: updatedCategory,
    };
  }

  async deleteCategory(slug: string): Promise<DeleteCategoryResponseType> {
    const category = await this.categoryRepository.findOne({ where: { slug } });

    if (!category) {
      throw new NotFoundException(`Category with Slug "${slug}" not found`);
    }

    await this.categoryRepository.delete(category.id);

    return {
      success: true,
      message: 'Category deleted successfully.',
    };
  }
}
