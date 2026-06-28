import { registerAs } from '@nestjs/config';

export const cacheConfig = registerAs('cache', () => ({
  ttl: parseInt(process.env.CACHE_TTL || '300', 10),
  maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
}));
