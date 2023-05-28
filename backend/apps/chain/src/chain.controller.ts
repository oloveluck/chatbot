import { Body, Controller, Post } from '@nestjs/common';
import { ChainService } from './chain.service';
import { PromptDto } from './dto/PromptDto';

@Controller()
export class ChainController {
  constructor(private readonly chainService: ChainService) {}

  @Post('/prompt')
  respond(@Body() body: PromptDto): Promise<string> {
    return this.chainService.respond(body.prompt);
  }
}
