import { registerAs } from '@nestjs/config';

export const voiceConfig = registerAs('voice', () => ({
  livekitHost: process.env.LIVEKIT_HOST,
  livekitApiKey: process.env.LIVEKIT_API_KEY,
  livekitApiSecret: process.env.LIVEKIT_API_SECRET,
  livekitWebhookSecret: process.env.LIVEKIT_WEBHOOK_SECRET,
}));
