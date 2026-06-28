import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  driver: process.env.STORAGE_DRIVER || 's3',
  bucket: process.env.STORAGE_BUCKET,
  region: process.env.STORAGE_REGION,
  accessKey: process.env.STORAGE_ACCESS_KEY,
  secretKey: process.env.STORAGE_SECRET_KEY,
  endpoint: process.env.STORAGE_ENDPOINT || undefined,
  cdnUrl: process.env.STORAGE_CDN_URL,
}));
