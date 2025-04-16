import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Order, OrderProduct, Product, User } from 'src/entities';
import { CreateOrderDto } from './dto/order.dto';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(OrderProduct)
    private orderProductRepo: Repository<OrderProduct>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<ResponseType<Order>> {
    const user = await this.userRepo.findOneByOrFail({ id: createOrderDto.userId });
  
    // Create initial order (without price yet)
    const order = this.orderRepo.create({
      user,
      delivery_method: createOrderDto.delivery_method,
      payment_method: createOrderDto.payment_method,
      region: createOrderDto.region,
      district: createOrderDto.district,
      extraAddress: createOrderDto.extraAddress,
      status: 'pending',
      shipping: createOrderDto.shipping ?? 0,
      coupon: createOrderDto.coupon ?? 0,
      price: 0,
    });
  
    const savedOrder = await this.orderRepo.save(order);
  
    let totalPrice = 0;
    const orderProducts: OrderProduct[] = [];
  
    for (const { productId, quantity } of createOrderDto.products) {
      const product = await this.productRepo.findOneByOrFail({ id: productId });
      const price = Number(product.currentPrice) * quantity;
      totalPrice += price;
  
      const orderProduct = await this.orderProductRepo.save(
        this.orderProductRepo.create({
          order: savedOrder,
          product,
          quantity,
          price,
        }),
      );
  
      orderProducts.push(orderProduct);
    }
  
    // 💰 Apply shipping and coupon to final total
    totalPrice = totalPrice + (createOrderDto.shipping ?? 0) - (createOrderDto.coupon ?? 0);
    if (totalPrice < 0) totalPrice = 0; // just in case
  
    savedOrder.products = orderProducts;
    savedOrder.price = totalPrice;
  
    const data = await this.orderRepo.save(savedOrder);
  
    return {
      success: true,
      message: 'Order made successfully',
      data,
    };
  }
}
