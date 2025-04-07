import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Subcategory } from 'src/entities';
import { ResponseType } from 'src/common/interfaces/general';
import { CreateSubCategoryDto, EditSubCategoryDto } from './dto';
import { FindAllPropsType } from './subcategory.interface';

@Injectable()
export class SubcategoryService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
  ) {}

  async findAll(): Promise<ResponseType<Subcategory[]>> {
    const subcategories = await this.subcategoryRepository.find({
      relations: ['category'],
    });

    return {
      success: true,
      message: 'Subcategories fetched successfully.',
      data: subcategories,
    };
  }

  async findAllWithPagination({
    page = 1,
    limit = 24,
    search,
    category,
  }: FindAllPropsType): Promise<ResponseType<Subcategory[]>> {
    try {
      await this.validatePagination(page, limit);

      const skip = (page - 1) * limit;

      const queryBuilder = this.subcategoryRepository
        .createQueryBuilder('subcategory')
        .leftJoinAndSelect('subcategory.category', 'category')
        .leftJoinAndSelect('subcategory.products', 'product')
        .orderBy('subcategory.id', 'ASC') // Ensure sorting is consistent
        .skip(skip)
        .take(limit);

      // Apply search filter
      if (search) {
        queryBuilder.andWhere('subcategory.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      // Apply category slug filter
      if (category) {
        queryBuilder.andWhere('category.slug = :categorySlug', {
          categorySlug: category,
        });
      }

      // Pagination and sorting
      queryBuilder.orderBy('subcategory.id', 'ASC').skip(skip).take(limit);

      const [subcategories, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Subcategories fetched successfully',
        data: subcategories,
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
        error?.message || 'Error while fetching subcategories',
      );
    }
  }

  async findById(id: string): Promise<ResponseType<Subcategory>> {
    const subcategory = await this.findSubcategoryOrFail(id);

    return {
      success: true,
      message: 'Subcategory found successfully.',
      data: subcategory,
    };
  }

  async createSubCategory(
    dto: CreateSubCategoryDto,
  ): Promise<ResponseType<Subcategory>> {
    await this.ensureSlugDoesNotExist(dto.slug);

    const subcategory = this.subcategoryRepository.create({
      ...dto,
      category: { id: dto.category },
    });

    await this.subcategoryRepository.save(subcategory);

    return {
      success: true,
      message: 'Subcategory created successfully.',
      data: subcategory,
    };
  }

  async editSubCategory(
    id: string,
    dto: EditSubCategoryDto,
  ): Promise<ResponseType<Subcategory>> {
    const subcategory = await this.findSubcategoryOrFail(id);

    Object.assign(subcategory, dto);
    const updatedSubcategory =
      await this.subcategoryRepository.save(subcategory);

    return {
      success: true,
      message: 'Subcategory updated successfully.',
      data: updatedSubcategory,
    };
  }

  async deleteSubCategory(id: string): Promise<ResponseType> {
    const subcategory = await this.findSubcategoryOrFail(id);
    await this.subcategoryRepository.delete(subcategory.id);

    return {
      success: true,
      message: 'Subcategory deleted successfully.',
    };
  }

  // Methods to improve code quality and maintainability
  private async validatePagination(page: number, limit: number) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0.');
    if (limit < 1)
      throw new BadRequestException('Limit must be greater than 0.');
  }

  // Helper method to find a subcategory by slug or throw NotFoundException
  private async findSubcategoryOrFail(id: string): Promise<Subcategory> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory with id "${id}" not found.`);
    }

    return subcategory;
  }

  // Helper method to ensure a subcategory slug does not already exist
  private async ensureSlugDoesNotExist(slug: string): Promise<void> {
    const existingSubcategory = await this.subcategoryRepository.findOne({
      where: { slug },
    });

    if (existingSubcategory) {
      throw new BadRequestException(
        `Subcategory with slug "${slug}" already exists.`,
      );
    }
  }
}
