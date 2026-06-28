import { registerAs } from '@nestjs/config';

export const paymentConfig = registerAs('payment', () => ({
  cashfreeAppId: process.env.CASHFREE_APP_ID,
  cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY,
  cashfreeApiVersion: process.env.CASHFREE_API_VERSION || '2022-09-01',
  cashfreeEnv: process.env.CASHFREE_ENV || 'SANDBOX',
}));
