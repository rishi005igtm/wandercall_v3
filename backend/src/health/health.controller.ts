import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisService } from '../modules/redis';

/**
 * HealthController — Kubernetes / Docker readiness and liveness probes.
 *
 * GET /api/v1/health        → liveness probe (process is running)
 * GET /api/v1/health/ready  → readiness probe (DB + Redis reachable)
 */
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  /** Liveness: just confirms the Node process is alive */
  @Get()
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Readiness: confirms downstream dependencies are reachable */
  @Get('ready')
  async readiness() {
    const checks: Record<string, string> = {};

    // PostgreSQL check
    try {
      await this.dataSource.query('SELECT 1');
      checks.postgres = 'ok';
    } catch {
      checks.postgres = 'error';
    }

    // Redis check
    try {
      await this.redisService.client.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }


    const allOk = Object.values(checks).every((v) => v === 'ok');

    const result = {
      status: allOk ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    };

    if (!allOk) {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result;
  }
}
