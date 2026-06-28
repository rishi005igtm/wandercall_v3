import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { MailService } from './services/mail.service';
import { UserAuthEntity } from './entities/user-auth.entity';
import { UserSessionEntity } from './entities/user-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAuthEntity, UserSessionEntity])],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, MailService],
  exports: [AuthService, AuthRepository, MailService, TypeOrmModule],
})
export class AuthModule {}
