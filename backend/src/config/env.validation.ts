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

/**
 * EnvironmentVariables — validated on startup via NestJS ConfigModule.
 *
 * Fields marked @IsNotEmpty() will crash the process if missing — intentional
 * for hard requirements (DB, JWT, etc.).
 *
 * Fields marked @IsOptional() degrade gracefully — the feature using them
 * (Kafka, Cloudinary, FCM, etc.) must handle the missing value internally.
 *
 * This prevents "startup failure in dev because Kafka isn't configured yet".
 */
export class EnvironmentVariables {
  // ─────────────────────────────────────────────────────────────────────────
  // Application — REQUIRED
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  APP_NAME?: string;

  @IsOptional()
  @IsEnum(Environment)
  APP_ENV?: Environment;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsOptional()
  @IsString()
  API_PREFIX?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // PostgreSQL — REQUIRED (no app without a database)
  // ─────────────────────────────────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsOptional()
  @IsInt()
  DB_PORT?: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsOptional()
  @IsString()
  DB_PASSWORD?: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsOptional()
  @IsBoolean()
  DB_SSL?: boolean;

  @IsOptional()
  @IsInt()
  DB_POOL_MIN?: number;

  @IsOptional()
  @IsInt()
  DB_POOL_MAX?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Redis — at least one of REDIS_URL or REDIS_HOST must be set,
  // enforced at runtime in RedisService. Both are optional here to allow
  // Upstash-only setups.
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsInt()
  REDIS_PORT?: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsOptional()
  @IsInt()
  REDIS_DB?: number;

  @IsOptional()
  @IsBoolean()
  REDIS_TLS?: boolean;

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsOptional()
  @IsString()
  UPSTASH_REDIS_REST_URL?: string;

  @IsOptional()
  @IsString()
  UPSTASH_REDIS_REST_TOKEN?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // JWT — REQUIRED (auth cannot function without secrets)
  // ─────────────────────────────────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsOptional()
  @IsInt()
  JWT_EXPIRES_IN?: number;

  @IsOptional()
  @IsInt()
  JWT_REFRESH_EXPIRES_IN?: number;

  @IsOptional()
  @IsString()
  JWT_ISSUER?: string;

  @IsOptional()
  @IsString()
  JWT_AUDIENCE?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Kafka — OPTIONAL (not currently used in active modules)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  KAFKA_BROKERS?: string;

  @IsOptional()
  @IsString()
  KAFKA_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  KAFKA_GROUP_ID?: string;

  @IsOptional()
  @IsBoolean()
  KAFKA_SSL?: boolean;

  @IsOptional()
  @IsString()
  KAFKA_SASL_USER?: string;

  @IsOptional()
  @IsString()
  KAFKA_SASL_PASS?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Payment — OPTIONAL (payment module is scaffolded, not yet active)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  CASHFREE_APP_ID?: string;

  @IsOptional()
  @IsString()
  CASHFREE_SECRET_KEY?: string;

  @IsOptional()
  @IsString()
  CASHFREE_API_VERSION?: string;

  @IsOptional()
  @IsString()
  CASHFREE_ENV?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Cloud Storage — OPTIONAL (Cloudinary credentials are the live path;
  // missing = uploads will warn but app starts)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  STORAGE_DRIVER?: string;

  @IsOptional()
  @IsString()
  STORAGE_BUCKET?: string;

  @IsOptional()
  @IsString()
  STORAGE_REGION?: string;

  @IsOptional()
  @IsString()
  STORAGE_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  STORAGE_SECRET_KEY?: string;

  @IsOptional()
  @IsString()
  STORAGE_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  STORAGE_CDN_URL?: string;

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

  // ─────────────────────────────────────────────────────────────────────────
  // Cache — OPTIONAL (defaults are acceptable)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsInt()
  CACHE_TTL?: number;

  @IsOptional()
  @IsInt()
  CACHE_MAX_ITEMS?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Search — OPTIONAL (social discovery degrades gracefully without it)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  SEARCH_HOST?: string;

  @IsOptional()
  @IsString()
  SEARCH_API_KEY?: string;

  @IsOptional()
  @IsString()
  SEARCH_INDEX_PREFIX?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // AI (OpenAI) — OPTIONAL (recommendation engine degrades without it)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  OPENAI_ORG_ID?: string;

  @IsOptional()
  @IsString()
  OPENAI_MODEL?: string;

  @IsOptional()
  @IsInt()
  OPENAI_TIMEOUT?: number;

  @IsOptional()
  @IsInt()
  OPENAI_MAX_RETRIES?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Mail (SMTP) — OPTIONAL (auth email verification degrades without it)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  MAIL_HOST?: string;

  @IsOptional()
  @IsInt()
  MAIL_PORT?: number;

  @IsOptional()
  @IsString()
  MAIL_USER?: string;

  @IsOptional()
  @IsString()
  MAIL_PASSWORD?: string;

  @IsOptional()
  @IsString()
  MAIL_FROM_EMAIL?: string;

  @IsOptional()
  @IsString()
  MAIL_FROM_NAME?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Push Notifications — OPTIONAL (mobile push not yet active)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  FCM_SERVER_KEY?: string;

  @IsOptional()
  @IsString()
  APNS_KEY_ID?: string;

  @IsOptional()
  @IsString()
  APNS_TEAM_ID?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // LiveKit (Voice/Video) — OPTIONAL (Campfire degrades without it)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  LIVEKIT_HOST?: string;

  @IsOptional()
  @IsString()
  LIVEKIT_API_KEY?: string;

  @IsOptional()
  @IsString()
  LIVEKIT_API_SECRET?: string;

  @IsOptional()
  @IsString()
  LIVEKIT_WEBHOOK_SECRET?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Security — OPTIONAL (has safe defaults, but set ENCRYPTION_KEY in prod)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsInt()
  BCRYPT_SALT_ROUNDS?: number;

  @IsOptional()
  @IsInt()
  RATE_LIMIT_TTL?: number;

  @IsOptional()
  @IsInt()
  RATE_LIMIT_MAX?: number;

  @IsOptional()
  @IsString()
  ENCRYPTION_KEY?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // Socket.IO — OPTIONAL (all have safe defaults; NestJS gateway shares port)
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsInt()
  SOCKET_PORT?: number;

  @IsOptional()
  @IsString()
  SOCKET_PATH?: string;

  @IsOptional()
  @IsString()
  SOCKET_CORS_ORIGIN?: string;

  @IsOptional()
  @IsInt()
  SOCKET_PING_INTERVAL?: number;

  @IsOptional()
  @IsInt()
  SOCKET_PING_TIMEOUT?: number;

  // ─────────────────────────────────────────────────────────────────────────
  // Analytics — OPTIONAL
  // ─────────────────────────────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  ANALYTICS_WRITE_KEY?: string;

  @IsOptional()
  @IsString()
  ANALYTICS_PROVIDER?: string;

  @IsOptional()
  @IsBoolean()
  ANALYTICS_ENABLED?: boolean;
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
    skipMissingProperties: true, // Only validate fields that ARE present
  });

  if (errors.length > 0) {
    throw new Error(
      `❌ Environment Validation Failed!\n` +
        `The application could not start due to invalid environment configuration:\n` +
        errors.map((err) => Object.values(err.constraints || {}).join(', ')).join('\n'),
    );
  }
  return validatedConfig;
}
