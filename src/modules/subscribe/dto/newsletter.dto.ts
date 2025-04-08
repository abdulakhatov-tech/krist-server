// dto/newsletter.dto.ts
import { IsEmail } from 'class-validator';

export class NewsletterDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;
}