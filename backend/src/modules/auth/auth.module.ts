import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { MailService } from './services/mail.service';
import { UserAuthEntity } from './entities/user-auth.entity';
import { UserSessionEntity } from './entities/user-session.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAuthEntity, UserSessionEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret', 'wandercall_jwt_secret_key_2026'),
        signOptions: {
          expiresIn: configService.get<number>('jwt.expiresIn', 3600),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, MailService, JwtStrategy, JwtAuthGuard, OptionalJwtAuthGuard],
  exports: [AuthService, AuthRepository, MailService, JwtStrategy, JwtAuthGuard, OptionalJwtAuthGuard, PassportModule, JwtModule, TypeOrmModule],
})
export class AuthModule {}
