import { registerAs } from '@nestjs/config';

export const analyticsConfig = registerAs('analytics', () => ({
  writeKey: process.env.ANALYTICS_WRITE_KEY,
  provider: process.env.ANALYTICS_PROVIDER || 'segment',
  enabled: process.env.ANALYTICS_ENABLED === 'true',
}));
