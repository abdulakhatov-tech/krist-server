import { Module } from '@nestjs/common';
import { SubscribeController } from './subscribe.controller';
import { SubscribeService } from './subscribe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Newsletter, User } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter, User])],
  controllers: [SubscribeController],
  providers: [SubscribeService],
  exports: [SubscribeService],
})
export class SubscribeModule {}
