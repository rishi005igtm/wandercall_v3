import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageController } from './controllers/storage.controller';
import { CloudinaryProvider } from './services/cloudinary.provider';
import { StorageService } from './services/storage.service';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [CloudinaryProvider, StorageService],
  exports: [StorageService, CloudinaryProvider],
})
export class StorageModule {}
