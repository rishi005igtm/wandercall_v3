import { registerAs } from '@nestjs/config';

export const securityConfig = registerAs('security', () => ({
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  encryptionKey: process.env.ENCRYPTION_KEY,
}));
