import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiOrgId: process.env.OPENAI_ORG_ID || undefined,
  openAiModel: process.env.OPENAI_MODEL || 'gpt-4o',
  timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000', 10),
  maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES || '3', 10),
}));
