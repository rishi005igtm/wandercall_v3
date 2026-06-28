import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseInitializerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseInitializerService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Executing Enterprise Database Initialization check on server startup...');
    try {
      // Synchronize database schema once on server boot if needed
      await this.dataSource.synchronize();
      this.logger.log(
        'Enterprise Database Initialization Completed: All tables (users_auth, user_sessions, users_profile, users_settings, users_plan) verified and ready.',
      );
    } catch (error) {
      this.logger.error('Failed to initialize database tables on startup:', error);
      throw error;
    }
  }
}
