import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannerService: BannersService) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    const queries = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    };

    return this.bannerService.findAll(queries);
  }

  @Get('/all')
  async findAllWithoutPagination() {
    return this.bannerService.findAllWithoutPagination();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.bannerService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannerService.createBanner(createBannerDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updadateBannerDto: CreateBannerDto,
  ) {
    return this.bannerService.editBanner(id, updadateBannerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.bannerService.deleteBanner(id);
  }
}
