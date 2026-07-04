import { Module, forwardRef } from '@nestjs/common';
import { PrivacyController } from './controllers/privacy.controller';
import { PrivacyService } from './services/privacy.service';
import { PrivacyRepository } from './repositories/privacy.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivacyRelationEntity } from './entities/privacy-relation.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PrivacyRelationEntity]),
    forwardRef(() => UserModule),
  ],
  controllers: [PrivacyController],
  providers: [PrivacyService, PrivacyRepository],
  exports: [PrivacyService],
})
export class PrivacyModule {}
