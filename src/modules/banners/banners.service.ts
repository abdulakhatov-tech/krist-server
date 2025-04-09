import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Banner } from 'src/entities';
import { CreateBannerDto } from './dto';
import { FindAllPropsType } from './banners.interface';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  async findAll({
    page = 1,
    limit = 24,
    search,
  }: FindAllPropsType): Promise<ResponseType<Banner[]>> {
    try {
      await this.validatePagination(page, limit);

      const skip = (page - 1) * limit;

      const queryBuilder = this.bannerRepository
        .createQueryBuilder('banner')
        .leftJoinAndSelect('banner.product', 'product')
        .orderBy('banner.id', 'ASC') // Ensure sorting is consistent
        .skip(skip)
        .take(limit);

      // Apply search filter
      if (search) {
        queryBuilder.andWhere('banner.name ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const [banners, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Banners fetched successfully.',
        data: banners,
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
      throw new Error(`Error fetching banners: ${error.message}`);
    }
  }

  async findAllWithoutPagination(): Promise<ResponseType<Banner[]>> {
    const banners = await this.bannerRepository.find({
      relations: ['product'],
    });

    return {
      success: true,
      message: 'Banners fetched successfully.',
      data: banners,
    };
  }

  async findById(id: string): Promise<ResponseType<Banner>> {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!banner) {
      throw new BadRequestException('Banner not found.');
    }

    return {
      success: true,
      message: 'Banner fetched successfully.',
      data: banner,
    };
  }

  async createBanner(dto: CreateBannerDto): Promise<ResponseType<Banner>> {
    const existing = await this.bannerRepository.findOne({
      where: { name: dto.name, product: { id: dto.product } },
    });

    if (existing) {
      throw new BadRequestException('Banner already exists for this product.');
    }

    const banner = this.bannerRepository.create({
      ...dto,
      product: { id: dto.product }, // associate relation using only id
    });

    const saved = await this.bannerRepository.save(banner);

    return {
      success: true,
      message: 'Banner created successfully.',
      data: saved,
    };
  }

  async editBanner(
    id: string,
    dto: Partial<CreateBannerDto>,
  ): Promise<ResponseType<Banner>> {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!banner) {
      throw new BadRequestException('Banner not found.');
    }

    // Optional duplicate check (only if both name and product are being updated)
    if (dto.name && dto.product) {
      const duplicate = await this.bannerRepository.findOne({
        where: {
          name: dto.name,
          product: { id: dto.product },
        },
      });

      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(
          'Another banner with this name and product already exists.',
        );
      }
    }


    // Apply updates
    if (dto.name) banner.name = dto.name;
    if (dto.slug) banner.slug = dto.slug;
    if (dto.description) banner.description = dto.description;
    if (dto.imageUrl) banner.imageUrl = dto.imageUrl;
    if (dto.isActive !== undefined) banner.isActive = dto.isActive;
    if (dto.product) banner.product = { id: dto.product } as any; // cast to avoid type error

    const updated = await this.bannerRepository.save(banner);

    return {
      success: true,
      message: 'Banner updated successfully.',
      data: updated,
    };
  }

  async deleteBanner(id: string): Promise<ResponseType> {
    const banner = await this.bannerRepository.findOne({ where: { id } });

    if (!banner) {
      throw new BadRequestException('Banner not found.');
    }

    await this.bannerRepository.remove(banner);

    return {
      success: true,
      message: 'Banner deleted successfully.',
    };
  }

  // Methods to improve code quality and maintainability
  private async validatePagination(page: number, limit: number) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0.');
    if (limit < 1)
      throw new BadRequestException('Limit must be greater than 0.');
  }
}
