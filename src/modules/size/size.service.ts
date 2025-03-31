import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { Size } from 'src/entities';
import { ResponseType } from 'src/common/interfaces/general';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SizeService {
  constructor(@InjectRepository(Size) private readonly sizeRepository: Repository<Size>) {}

  async findAll(): Promise<ResponseType<Size[]>> {
    const sizes = await this.sizeRepository.find();

    return {
      success: true,
      message: 'Sizes fetched successfully',
      data: sizes,
    };
  }

  async findById(id: string): Promise<ResponseType<Size>> {
    const size = await this.sizeRepository.findOne({ where: { id } });

    if (!size) {
      throw new NotFoundException('Size not found');
    }

    return {
      success: true,
      message: 'Size fetched successfully',
      data: size,
    };
  }

  async createSize(dto: CreateSizeDto): Promise<ResponseType<Size>> {
    const existingSize = await this.sizeRepository.findOne({
      where: { name: dto.name },
    });

    if (existingSize) {
      throw new BadRequestException('Size already exists!');
    }

    const size = this.sizeRepository.create(dto);
    await this.sizeRepository.save(size);

    return {
      success: true,
      message: 'Size added successfully',
      data: size,
    };
  }

  async editSize(id: string, dto: UpdateSizeDto): Promise<ResponseType<Size>> {
    const size = await this.sizeRepository.findOne({ where: { id } });

    if (!size) {
      throw new NotFoundException('Size not found');
    }

    const existingSize = await this.sizeRepository.findOne({
      where: { name: dto.name },
    });

    if (existingSize) {
      throw new BadRequestException('Size already exists!');
    }

    Object.assign(size, dto);
    const updatedSize = await this.sizeRepository.save(size);

    return {
      success: true,
      message: 'Size updated successfully',
      data: updatedSize,
    };
  }

  async deleteSize(id: string): Promise<ResponseType> {
    const size = await this.sizeRepository.findOne({ where: { id } });

    if (!size) {
      throw new NotFoundException('Size not found');
    }

    await this.sizeRepository.delete(id);

    return {
      success: true,
      message: 'Size deleted successfully.',
    };
  }
}
