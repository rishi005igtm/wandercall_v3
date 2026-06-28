import { registerAs } from '@nestjs/config';

export const searchConfig = registerAs('search', () => ({
  host: process.env.SEARCH_HOST,
  apiKey: process.env.SEARCH_API_KEY,
  indexPrefix: process.env.SEARCH_INDEX_PREFIX || 'wandercall_',
}));
