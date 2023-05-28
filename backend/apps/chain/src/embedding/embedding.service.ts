import { Injectable } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class EmbeddingService {
  private client: PineconeClient;
  constructor() {
    this.client = new PineconeClient();
  }

  async query(
    indexName: string,
    vector: number[],
    k?: number,
    filter?: Record<string, unknown>,
  ) {
    await this.client.init({
      environment: process.env.PINECONE_API_REGION,
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = this.client.Index(indexName);
    const queryRequest = {
      vector,
      topK: k | 3,
      includeValues: true,
      includeMetadata: true,
      filter,
    };
    const queryResponse = await index.query({ queryRequest });
    return queryResponse;
  }
}
