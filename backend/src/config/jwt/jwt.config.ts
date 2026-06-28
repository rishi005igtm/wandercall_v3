import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600', 10),
  refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10),
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
}));
