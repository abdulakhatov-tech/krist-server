import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NewsletterDto } from './dto';
import { Newsletter } from 'src/entities';
import { User } from 'src/entities/user.entity'; // Assuming you have a User entity
import { FindAllPropsType } from './subscribe.interface';
import { ResponseType } from 'src/common/interfaces/general';

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
    const existing = await this.subscribeRepository.findOne({
      where: { email },
    });

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
      throw new InternalServerErrorException(
        'Failed to subscribe. Please try again later.',
      );
    }
  }

  async findAll({
    page = 1,
    limit = 24,
    search,
  }: FindAllPropsType): Promise<ResponseType<Newsletter[]>> {
    try {
      await this.validatePagination(page, limit);

      const skip = (page - 1) * limit;

      const queryBuilder = this.subscribeRepository
        .createQueryBuilder('newsletter')
        .leftJoinAndSelect('newsletter.user', 'user')
        .orderBy('newsletter.id', 'ASC')
        .skip(skip)
        .take(limit);

      // Apply search filter
      if (search) {
        queryBuilder.andWhere('newsletter.email ILIKE :search', {
          search: `%${search}%`,
        });
      }

      const [newsletters, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Newsletters fetched successfully',
        data: newsletters,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch newsletters. Please try again later.',
      );
    }
  }

  async deleteNewsletter(id: string): Promise<ResponseType> {
    const newsletter = await this.subscribeRepository.findOne({ where: { id } });

    if (!newsletter) {
      throw new BadRequestException('Newsletter not found.');
    }

    try {
      await this.subscribeRepository.delete(id);
      return {
        success: true,
        message: 'Newsletter deleted successfully.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete newsletter. Please try again later.',
      );
    }
  }

  // Methods to improve code quality and maintainability
  private async validatePagination(page: number, limit: number) {
    if (page < 1) throw new BadRequestException('Page must be greater than 0.');
    if (limit < 1)
      throw new BadRequestException('Limit must be greater than 0.');
  }
}
