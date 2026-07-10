import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis-core.service';
import { CampfireRedisKeys } from '../constants/campfire.redis-keys';
import { CampfireEntity } from '../entities/campfire.entity';

@Injectable()
export class CampfireCacheService {
  private readonly logger = new Logger(CampfireCacheService.name);
  private readonly ttl: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.ttl = this.configService.get<number>('campfire.cache.ttl') || 3600;
  }

  async getCampfire(id: string): Promise<CampfireEntity | null> {
    try {
      const key = CampfireRedisKeys.base(id);
      const data = await this.redisService.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as CampfireEntity;
    } catch (error) {
      this.logger.error(`Failed to get campfire from cache: ${error.message}`);
      return null;
    }
  }

  async setCampfire(campfire: CampfireEntity): Promise<void> {
    try {
      const id = campfire.id;
      const key = CampfireRedisKeys.base(id);
      
      const pipeline = this.redisService.client.pipeline();
      
      // Store the base entity
      pipeline.set(key, JSON.stringify(campfire), 'EX', this.ttl);
      
      // Initialize sets (empty) if they don't exist yet so discovery works immediately
      // SADD with no members isn't valid, but we can set an expiry on the key or just let them be created dynamically.
      // Actually, if we just want to ensure they exist, we can add a dummy member or simply rely on the fact that
      // when empty, Redis treats them as non-existent. But we should set an expiration on the keys if we do touch them.
      // Instead of SADD, we don't need to explicitly initialize sets in Redis because Redis auto-creates sets on SADD.
      // However, the prompt asks: "Automatically initialize Redis structures... Redis structures should already exist."
      // We will add a 'init' string to each set to instantiate it, then set TTL.
      
      const sets = [
        CampfireRedisKeys.presence(id),
        CampfireRedisKeys.listeners(id),
        CampfireRedisKeys.speakers(id),
        CampfireRedisKeys.queue(id),
        CampfireRedisKeys.chat(id),
      ];

      for (const setKey of sets) {
        pipeline.sadd(setKey, '__init__');
        pipeline.expire(setKey, this.ttl);
      }

      await pipeline.exec();
    } catch (error) {
      this.logger.error(`Failed to set campfire in cache: ${error.message}`);
    }
  }

  async invalidateCampfire(id: string): Promise<void> {
    try {
      const pipeline = this.redisService.client.pipeline();
      
      pipeline.del(CampfireRedisKeys.base(id));
      pipeline.del(CampfireRedisKeys.presence(id));
      pipeline.del(CampfireRedisKeys.listeners(id));
      pipeline.del(CampfireRedisKeys.speakers(id));
      pipeline.del(CampfireRedisKeys.queue(id));
      pipeline.del(CampfireRedisKeys.chat(id));
      pipeline.del(CampfireRedisKeys.events(id));
      
      await pipeline.exec();
    } catch (error) {
      this.logger.error(`Failed to invalidate campfire cache: ${error.message}`);
    }
  }
}
