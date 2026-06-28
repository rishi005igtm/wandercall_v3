import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
  host: process.env.EMAIL_HOST || process.env.MAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || process.env.MAIL_PORT || '587', 10),
  user: process.env.EMAIL_USER || process.env.MAIL_USER,
  password: process.env.EMAIL_PASS || process.env.MAIL_PASSWORD,
  fromEmail: process.env.EMAIL_FROM || process.env.MAIL_FROM_EMAIL,
  fromName: process.env.MAIL_FROM_NAME || 'Wandercall Team',
}));
