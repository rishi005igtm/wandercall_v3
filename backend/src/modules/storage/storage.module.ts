import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageController } from './controllers/storage.controller';
import { CloudinaryProvider } from './services/cloudinary.provider';
import { StorageService } from './services/storage.service';
import { MediaUploadEntity } from './entities/media-upload.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MediaUploadEntity])],
  controllers: [StorageController],
  providers: [CloudinaryProvider, StorageService],
  exports: [StorageService, CloudinaryProvider],
})
export class StorageModule {}
