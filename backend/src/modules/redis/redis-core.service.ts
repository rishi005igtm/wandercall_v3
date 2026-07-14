import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Redis as UpstashRedis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  // TCP Connection for Pub/Sub and heavy operations
  private tcpClient: Redis;
  private tcpSubscriber: Redis;

  // REST Connection for stateless edge operations and serverless compatibility
  private restClient: UpstashRedis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url');
    const upstashUrl = this.configService.get<string>('redis.upstashUrl');
    const upstashToken = this.configService.get<string>('redis.upstashToken');

    if (redisUrl) {
      this.tcpClient = new Redis(redisUrl, {
        retryStrategy(times) {
          return Math.min(times * 50, 2000);
        },
        maxRetriesPerRequest: 3,
      });

      this.tcpSubscriber = new Redis(redisUrl, {
        retryStrategy(times) {
          return Math.min(times * 50, 2000);
        },
        maxRetriesPerRequest: 3,
      });

      this.tcpClient.on('error', (err) =>
        this.logger.error('Redis TCP Client Error:', err),
      );
      this.tcpSubscriber.on('error', (err) =>
        this.logger.error('Redis TCP Subscriber Error:', err),
      );
    } else {
      const host = this.configService.get<string>('redis.host');
      const port = this.configService.get<number>('redis.port');
      const password = this.configService.get<string>('redis.password');
      const db = this.configService.get<number>('redis.db');

      const config = { host, port, password, db };
      this.tcpClient = new Redis(config);
      this.tcpSubscriber = new Redis(config);
    }

    if (upstashUrl && upstashToken) {
      this.restClient = new UpstashRedis({
        url: upstashUrl,
        token: upstashToken,
      });
    } else {
      this.logger.warn(
        'Upstash REST configuration missing. Falling back to TCP client for REST methods if needed.',
      );
    }
  }

  onModuleDestroy() {
    this.tcpClient?.disconnect();
    this.tcpSubscriber?.disconnect();
  }

  get client(): Redis {
    return this.tcpClient;
  }

  get subscriber(): Redis {
    return this.tcpSubscriber;
  }

  get rest(): UpstashRedis {
    if (!this.restClient) {
      throw new Error('Upstash REST client is not configured.');
    }
    return this.restClient;
  }

  /**
   * Helper for standard tenant-isolated key generation
   */
  generateKey(
    tenantId: string,
    entity: string,
    entityId: string,
    suffix?: string,
  ): string {
    const base = `prefix:${tenantId}:${entity}:${entityId}`;
    return suffix ? `${base}:${suffix}` : base;
  }
}
