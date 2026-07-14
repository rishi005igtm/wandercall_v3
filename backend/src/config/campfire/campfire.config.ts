import { registerAs } from '@nestjs/config';

export default registerAs('campfire', () => ({
  limits: {
    defaultCapacity: parseInt(
      process.env.CAMPFIRE_DEFAULT_CAPACITY || '50',
      10,
    ),
    maxCapacity: parseInt(process.env.CAMPFIRE_MAX_CAPACITY || '1000', 10),
    defaultSpeakerLimit: parseInt(
      process.env.CAMPFIRE_DEFAULT_SPEAKER_LIMIT || '10',
      10,
    ),
    maxSpeakerLimit: parseInt(
      process.env.CAMPFIRE_MAX_SPEAKER_LIMIT || '50',
      10,
    ),
    defaultListenerLimit: parseInt(
      process.env.CAMPFIRE_DEFAULT_LISTENER_LIMIT || '50',
      10,
    ),
  },
  cache: {
    ttl: parseInt(process.env.CAMPFIRE_CACHE_TTL || '3600', 10), // 1 hour
    presenceTtl: parseInt(process.env.CAMPFIRE_PRESENCE_TTL || '300', 10), // 5 mins
  },
  redis: {
    prefix: 'campfire',
  },
}));
