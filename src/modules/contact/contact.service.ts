import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { ResponseType } from 'src/common/interfaces/general';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
  ) {}

  async create(
    createContactDto: CreateContactDto,
  ): Promise<ResponseType<Contact>> {
    const contact = this.contactRepo.create(createContactDto);
    const savedContact = await this.contactRepo.save(contact);

    return {
      success: true,
      message: 'ok',
      data: savedContact,
    };
  }
}
