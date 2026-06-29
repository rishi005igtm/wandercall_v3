import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  driver: process.env.STORAGE_DRIVER || 'cloudinary',
  bucket: process.env.STORAGE_BUCKET,
  region: process.env.STORAGE_REGION,
  accessKey: process.env.STORAGE_ACCESS_KEY,
  secretKey: process.env.STORAGE_SECRET_KEY,
  endpoint: process.env.STORAGE_ENDPOINT || undefined,
  cdnUrl: process.env.STORAGE_CDN_URL,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    url: process.env.CLOUDINARY_URL,
  },
}));
