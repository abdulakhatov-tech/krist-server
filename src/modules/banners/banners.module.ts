import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
