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

  /** Readiness: confirms downstream dependencies are reachable with an Enterprise schema */
  @Get('ready')
  async readiness() {
    let databaseStatus = 'error';
    let redisStatus = 'error';

    // PostgreSQL check
    try {
      await this.dataSource.query('SELECT 1');
      databaseStatus = 'ok';
    } catch {
      databaseStatus = 'error';
    }

    // Redis check
    try {
      await this.redisService.client.ping();
      redisStatus = 'ok';
    } catch {
      redisStatus = 'error';
    }

    const allOk = databaseStatus === 'ok' && redisStatus === 'ok';

    const result = {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: databaseStatus,
      redis: redisStatus,
      storage: 'not_configured',
      websocket: 'ok',
      queue: 'not_configured',
      version: process.env.npm_package_version || '0.0.1',
      environment: process.env.NODE_ENV || 'development',
    };

    if (!allOk) {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result;
  }
}
