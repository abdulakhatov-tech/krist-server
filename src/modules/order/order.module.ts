import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order, OrderProduct, Product, User } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderProduct, Product, User])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
