import { Body, Controller, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { ApplyCouponDto } from './dto/applyCoupon.dto';

@Controller('coupon')
export class CouponController {
    constructor(private couponService: CouponService) {}

    @Post('apply')
    async applyCoupon(@Body() dto: ApplyCouponDto) {
        return this.couponService.applyCoupon(dto)
    }

}
