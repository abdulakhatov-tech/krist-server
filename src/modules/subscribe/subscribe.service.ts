import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NewsletterDto } from './dto';
import { Newsletter } from 'src/entities';

@Injectable()
export class SubscribeService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly subscribeRepository: Repository<Newsletter>,
  ) {}

  async subscribeToNewsletter(
    newsletterDto: NewsletterDto,
  ): Promise<{ success: boolean; message: string }> {
    const { email } = newsletterDto;

    const existing = await this.subscribeRepository.findOne({ where: { email } });

    if (existing) {
      throw new ConflictException('This email is already subscribed.');
    }

    try {
      await this.subscribeRepository.save({ email });

      return {
        success: true,
        message: 'Subscribed successfully. Welcome to our newsletter!',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to subscribe. Please try again later.');
    }
  }
}
