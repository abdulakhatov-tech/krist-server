import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Subcategory } from 'src/entities';
import { ResponseType } from 'src/common/interfaces/general';
import { CreateSubCategoryDto, EditSubCategoryDto } from './dto';

@Injectable()
export class SubcategoryService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
  ) {}

  async findAll(): Promise<ResponseType<Subcategory[]>> {
    const subcategories = await this.subcategoryRepository.find();

    return {
      success: true,
      message: 'Subcategories fetched successfully.',
      data: subcategories,
    };
  }

  async findBySlug(slug: string): Promise<ResponseType<Subcategory>> {
    const subcategory = await this.findSubcategoryOrFail(slug);

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
    slug: string,
    dto: EditSubCategoryDto,
  ): Promise<ResponseType<Subcategory>> {
    const subcategory = await this.findSubcategoryOrFail(slug);

    Object.assign(subcategory, dto);
    const updatedSubcategory =
      await this.subcategoryRepository.save(subcategory);

    return {
      success: true,
      message: 'Subcategory updated successfully.',
      data: updatedSubcategory,
    };
  }

  async deleteSubCategory(slug: string): Promise<ResponseType> {
    const subcategory = await this.findSubcategoryOrFail(slug);
    await this.subcategoryRepository.delete(subcategory.id);

    return {
      success: true,
      message: 'Subcategory deleted successfully.',
    };
  }

  // Helper method to find a subcategory by slug or throw NotFoundException
  private async findSubcategoryOrFail(slug: string): Promise<Subcategory> {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { slug },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory with slug "${slug}" not found.`);
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
