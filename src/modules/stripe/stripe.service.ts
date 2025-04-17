import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CheckoutDto } from './dto';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeKey = this.configService.get<string>('STRIPE_KEY');
    this.stripe = new Stripe(stripeKey!);
  }

  async createCheckoutSession(dto: CheckoutDto) {
    let totalPrice = dto.products?.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    if (dto.coupon) {
      totalPrice = totalPrice - dto.coupon;
    }

    if (dto.shipping) {
      totalPrice = totalPrice + dto.shipping;
    }

    const line_items = dto.products?.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: [item.imageUrl],
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${this.configService.get('CLIENT_URL')}?checkout=success`,
      cancel_url: `${this.configService.get('CLIENT_URL')}/cart`,
    });

    return { url: session.url };
  }
}
