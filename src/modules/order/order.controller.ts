import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    async create(@Body() createOrderDto: CreateOrderDto) {
        return this.orderService.create(createOrderDto);
    }
}
