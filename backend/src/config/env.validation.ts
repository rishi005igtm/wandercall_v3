import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

export class EnvironmentVariables {
  // --- Application ---
  @IsString()
  @IsNotEmpty()
  APP_NAME: string;

  @IsEnum(Environment)
  APP_ENV: Environment;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  @IsNotEmpty()
  API_PREFIX: string;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS: string;

  // --- Database ---
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsInt()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsBoolean()
  DB_SSL: boolean;

  @IsInt()
  DB_POOL_MIN: number;

  @IsInt()
  DB_POOL_MAX: number;

  // --- Redis ---
  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsInt()
  REDIS_PORT: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsInt()
  REDIS_DB: number;

  @IsBoolean()
  REDIS_TLS: boolean;

  // --- Kafka ---
  @IsString()
  @IsNotEmpty()
  KAFKA_BROKERS: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_GROUP_ID: string;

  @IsBoolean()
  KAFKA_SSL: boolean;

  @IsOptional()
  @IsString()
  KAFKA_SASL_USER?: string;

  @IsOptional()
  @IsString()
  KAFKA_SASL_PASS?: string;

  // --- JWT ---
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsInt()
  JWT_EXPIRES_IN: number;

  @IsInt()
  JWT_REFRESH_EXPIRES_IN: number;

  @IsString()
  @IsNotEmpty()
  JWT_ISSUER: string;

  @IsString()
  @IsNotEmpty()
  JWT_AUDIENCE: string;

  // --- Cashfree Payment Gateway ---
  @IsString()
  @IsNotEmpty()
  CASHFREE_APP_ID: string;

  @IsString()
  @IsNotEmpty()
  CASHFREE_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  CASHFREE_API_VERSION: string;

  @IsString()
  @IsNotEmpty()
  CASHFREE_ENV: string;

  // --- Cloud Storage ---
  @IsString()
  @IsNotEmpty()
  STORAGE_DRIVER: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_REGION: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_SECRET_KEY: string;

  @IsOptional()
  @IsString()
  STORAGE_ENDPOINT?: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_CDN_URL: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_CLOUD_NAME?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_KEY?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_API_SECRET?: string;

  @IsOptional()
  @IsString()
  CLOUDINARY_URL?: string;

  // --- Cache ---
  @IsInt()
  CACHE_TTL: number;

  @IsInt()
  CACHE_MAX_ITEMS: number;

  // --- Search Engine ---
  @IsString()
  @IsNotEmpty()
  SEARCH_HOST: string;

  @IsString()
  @IsNotEmpty()
  SEARCH_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  SEARCH_INDEX_PREFIX: string;

  // --- AI Services ---
  @IsString()
  @IsNotEmpty()
  OPENAI_API_KEY: string;

  @IsOptional()
  @IsString()
  OPENAI_ORG_ID?: string;

  @IsString()
  @IsNotEmpty()
  OPENAI_MODEL: string;

  @IsInt()
  OPENAI_TIMEOUT: number;

  @IsInt()
  OPENAI_MAX_RETRIES: number;

  // --- Mail Server ---
  @IsString()
  @IsNotEmpty()
  MAIL_HOST: string;

  @IsInt()
  MAIL_PORT: number;

  @IsString()
  @IsNotEmpty()
  MAIL_USER: string;

  @IsString()
  MAIL_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM_NAME: string;

  // --- Push Notifications ---
  @IsString()
  @IsNotEmpty()
  FCM_SERVER_KEY: string;

  @IsString()
  @IsNotEmpty()
  APNS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  APNS_TEAM_ID: string;

  // --- Voice & Video (LiveKit) ---
  @IsString()
  @IsNotEmpty()
  LIVEKIT_HOST: string;

  @IsString()
  @IsNotEmpty()
  LIVEKIT_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  LIVEKIT_API_SECRET: string;

  @IsString()
  @IsNotEmpty()
  LIVEKIT_WEBHOOK_SECRET: string;

  // --- Security & Rate Limiting ---
  @IsInt()
  BCRYPT_SALT_ROUNDS: number;

  @IsInt()
  RATE_LIMIT_TTL: number;

  @IsInt()
  RATE_LIMIT_MAX: number;

  @IsString()
  @IsNotEmpty()
  ENCRYPTION_KEY: string;

  // --- WebSockets / Socket.IO ---
  @IsInt()
  SOCKET_PORT: number;

  @IsString()
  @IsNotEmpty()
  SOCKET_PATH: string;

  @IsString()
  @IsNotEmpty()
  SOCKET_CORS_ORIGIN: string;

  @IsInt()
  SOCKET_PING_INTERVAL: number;

  @IsInt()
  SOCKET_PING_TIMEOUT: number;

  // --- Analytics ---
  @IsString()
  @IsNotEmpty()
  ANALYTICS_WRITE_KEY: string;

  @IsString()
  @IsNotEmpty()
  ANALYTICS_PROVIDER: string;

  @IsBoolean()
  ANALYTICS_ENABLED: boolean;
}

export function validate(config: Record<string, unknown>) {
  const convertedConfig: Record<string, unknown> = { ...config };
  for (const key of Object.keys(convertedConfig)) {
    if (convertedConfig[key] === 'true') convertedConfig[key] = true;
    if (convertedConfig[key] === 'false') convertedConfig[key] = false;
  }

  const validatedConfig = plainToInstance(EnvironmentVariables, convertedConfig, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `❌ Environment Validation Failed!\n` +
        `The application could not start due to missing or invalid environment configuration:\n` +
        errors.map((err) => Object.values(err.constraints || {}).join(', ')).join('\n'),
    );
  }
  return validatedConfig;
}
