import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { UserAuthEntity } from './modules/auth/entities/user-auth.entity';
import { UserSessionEntity } from './modules/auth/entities/user-session.entity';
import { UserProfileEntity } from './modules/user/entities/user-profile.entity';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isSsl = process.env.DB_SSL === 'true';
        const options: any = {
          type: 'postgres',
          host: configService.get<string>('database.host', 'localhost'),
          port: configService.get<number>('database.port', 5432),
          username: configService.get<string>('database.username', 'postgres'),
          password: configService.get<string>('database.password', 'anmol162004'),
          database: configService.get<string>('database.name', 'postgres'),
          entities: [UserAuthEntity, UserSessionEntity, UserProfileEntity],
          synchronize: true, // Auto-create tables on startup in dev
          autoLoadEntities: true,
        };

        if (isSsl) {
          options.ssl = { rejectUnauthorized: false };
        } else {
          options.ssl = false;
        }

        return options;
      },
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
