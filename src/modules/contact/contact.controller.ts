import { Body, Controller, Post } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactService } from './contact.service';

@Controller('contact-us')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post()
    create(@Body() createContactDto: CreateContactDto) {
      return this.contactService.create(createContactDto);
    }
}
