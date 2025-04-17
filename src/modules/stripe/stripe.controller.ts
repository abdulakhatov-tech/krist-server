import { Body, Controller, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Product } from 'src/entities';
import { CheckoutDto } from './dto';

@Controller('payment')
export class StripeController {
    constructor(private stripeService: StripeService) {}

    @Post('checkout')
    async checkout(@Body() dto: CheckoutDto) {
        return this.stripeService.createCheckoutSession(dto)
    }
}
