import { Body, Controller, Post } from '@nestjs/common';
import { SubscribeService } from './subscribe.service';
import { NewsletterDto } from './dto';

@Controller('subscribe')
export class SubscribeController {
    constructor(private readonly subscribeService: SubscribeService) {}

    @Post('/newsletter')
    async subscribeToNewsletter(@Body() newsletterDto: NewsletterDto) {
        return this.subscribeService.subscribeToNewsletter(newsletterDto);
    }
}
