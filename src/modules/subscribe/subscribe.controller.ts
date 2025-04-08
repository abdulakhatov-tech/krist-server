import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { NewsletterDto } from './dto';

@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly subscribeService: SubscribeService) {}

  @Post('/newsletter')
  async subscribeToNewsletter(@Body() newsletterDto: NewsletterDto) {
    return this.subscribeService.subscribeToNewsletter(newsletterDto);
  }

  @Get('/newsletter')
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
  ) {
    const queries = {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    };

    return this.subscribeService.findAll(queries);
  }

    @Delete('/newsletter/:id')
    async remove(@Param('id') id: string) {
      return this.subscribeService.deleteNewsletter(id);
    }
}
