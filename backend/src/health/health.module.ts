import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { RedisModule } from '../modules/redis';

@Module({
  imports: [TypeOrmModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
