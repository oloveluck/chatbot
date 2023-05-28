import { Module } from '@nestjs/common';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';
import { EmbeddingModule } from './embedding/embedding.module';

@Module({
  imports: [EmbeddingModule],
  controllers: [ChainController],
  providers: [ChainService],
})
export class ChainModule {}
