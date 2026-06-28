import { registerAs } from '@nestjs/config';

export const kafkaConfig = registerAs('kafka', () => ({
  brokers: (process.env.KAFKA_BROKERS || '').split(',').map((b) => b.trim()),
  clientId: process.env.KAFKA_CLIENT_ID,
  groupId: process.env.KAFKA_GROUP_ID,
  ssl: process.env.KAFKA_SSL === 'true',
  saslUser: process.env.KAFKA_SASL_USER || undefined,
  saslPass: process.env.KAFKA_SASL_PASS || undefined,
}));
