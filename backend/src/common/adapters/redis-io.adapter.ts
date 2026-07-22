import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  constructor(
    app: any,
    private readonly configService: ConfigService,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ||
      this.configService.get<string>('redis.url');
    const host =
      this.configService.get<string>('REDIS_HOST') ||
      this.configService.get<string>('redis.host', 'localhost');
    const port =
      this.configService.get<number>('REDIS_PORT') ||
      this.configService.get<number>('redis.port', 6379);
    const password =
      this.configService.get<string>('REDIS_PASSWORD') ||
      this.configService.get<string>('redis.password');

    let pubClient: Redis;
    let subClient: Redis;

    try {
      if (redisUrl) {
        pubClient = new Redis(redisUrl, { maxRetriesPerRequest: null });
        subClient = pubClient.duplicate();
      } else {
        pubClient = new Redis({ host, port, password, maxRetriesPerRequest: null });
        subClient = pubClient.duplicate();
      }

      pubClient.on('error', (err) =>
        this.logger.error('Redis IoAdapter Pub Client Error:', err),
      );
      subClient.on('error', (err) =>
        this.logger.error('Redis IoAdapter Sub Client Error:', err),
      );

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log('RedisIoAdapter successfully connected to Redis Pub/Sub');
    } catch (error) {
      this.logger.error('Failed to connect RedisIoAdapter to Redis:', error);
    }
  }

  override createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
