import { registerAs } from '@nestjs/config';

export const notificationConfig = registerAs('notification', () => ({
  fcmServerKey: process.env.FCM_SERVER_KEY,
  apnsKeyId: process.env.APNS_KEY_ID,
  apnsTeamId: process.env.APNS_TEAM_ID,
}));
