import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/coupon.entity';
import { Repository } from 'typeorm';
import { ApplyCouponDto } from './dto/applyCoupon.dto';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async applyCoupon(dto: ApplyCouponDto): Promise<
    ResponseType<{
      coupon: string;
      discount: number;
      total: number;
    }>
  > {
    const { code, subtotal } = dto;

    const coupon = await this.couponRepository.findOne({
      where: { code, isActive: true },
    });
    if (!coupon) throw new NotFoundException('Coupon not found or expired!');

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('Coupon has expired!');
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * Number(coupon.amount)) / 100;
    } else {
      discount = Number(coupon.amount);
    }

    const final = Math.max(0, subtotal - discount);

    return {
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        coupon: coupon.code,
        discount: +discount.toFixed(2),
        total: +final.toFixed(2),
      },
    };
  }
}
