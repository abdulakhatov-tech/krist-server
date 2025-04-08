import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NewsletterDto } from './dto';
import { Newsletter } from 'src/entities';
import { User } from 'src/entities/user.entity'; // Assuming you have a User entity

@Injectable()
export class SubscribeService {
  constructor(
    @InjectRepository(Newsletter)
    private readonly subscribeRepository: Repository<Newsletter>,
    
    @InjectRepository(User) // Inject the User repository
    private readonly userRepository: Repository<User>,
  ) {}

  async subscribeToNewsletter(
    newsletterDto: NewsletterDto,
  ): Promise<{ success: boolean; message: string }> {
    const { email } = newsletterDto;

    // Check if email is already subscribed
    const existing = await this.subscribeRepository.findOne({ where: { email } });

    if (existing) {
      throw new ConflictException('This email is already subscribed.');
    }

    // Try to find an existing user with the provided email
    let user = await this.userRepository.findOne({ where: { email } });

    let newNewsletter = new Newsletter();
    newNewsletter.email = email;

    if (user) {
      // If the user exists, link the newsletter to the user
      newNewsletter.user = user;
    }

    try {
      // Save the new newsletter subscription
      await this.subscribeRepository.save(newNewsletter);

      return {
        success: true,
        message: user
          ? 'Subscribed successfully and linked to your account!'
          : 'Subscribed successfully. Welcome to our newsletter!',
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to subscribe. Please try again later.');
    }
  }
}
