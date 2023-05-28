import { Injectable } from '@nestjs/common';
import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { config } from 'dotenv';
import { PromptTemplate } from 'langchain';
import { EmbeddingService } from './embedding/embedding.service';
import { ScoredVector } from '@pinecone-database/pinecone';

config();

@Injectable()
export class ChainService {
  private model: OpenAI;
  private embeddings: OpenAIEmbeddings;
  private embeddingService: EmbeddingService;
  constructor() {
    this.model = new OpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    });
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    this.embeddingService = new EmbeddingService();
  }

  async respond(prompt: string): Promise<string> {
    const generatedPrompt = await this.generatePrompt(prompt);
    console.log(`Prompt: ${generatedPrompt}`);
    const response = await this.model.call(generatedPrompt);
    return response;
  }

  async generatePrompt(prompt: string): Promise<string> {
    const embedding = await this.embeddings.embedQuery(prompt);
    const queryResponse = await this.embeddingService.query(
      'langchain-retrieval-augmentation',
      embedding,
      3,
    );

    const template = `Answer the question based on the context below.
    
    Context: {context}

    Question: {prompt}`;

    const promptTemplate = new PromptTemplate({
      template,
      inputVariables: ['context', 'prompt'],
    });

    const context = queryResponse.matches.reduce(
      (acc: string, match: ScoredVector) => {
        return `${acc}\n${(match.metadata as any).text || ''}`;
      },
      '',
    );

    return promptTemplate.format({ prompt, context });
  }
}
