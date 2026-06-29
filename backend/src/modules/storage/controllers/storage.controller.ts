import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DeleteAssetRequestDto } from '../dto/delete-asset-request.dto';
import { ReplaceAssetRequestDto } from '../dto/replace-asset-request.dto';
import { StorageAssetResponseDto } from '../dto/storage-asset-response.dto';
import { UploadAssetRequestDto } from '../dto/upload-asset-request.dto';
import { StorageService } from '../services/storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'Wandercall Centralized Storage Service',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAsset(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAssetRequestDto,
  ): Promise<StorageAssetResponseDto> {
    const metadata = await this.storageService.uploadFile(
      file,
      dto.intent,
      dto.entityId,
      dto.customFilename,
    );
    return new StorageAssetResponseDto(metadata);
  }

  @Post('replace')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async replaceAsset(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ReplaceAssetRequestDto,
  ): Promise<StorageAssetResponseDto> {
    const metadata = await this.storageService.replaceFile(
      file,
      dto.oldPublicId,
      dto.intent,
      dto.entityId,
    );
    return new StorageAssetResponseDto(metadata);
  }

  @Delete('asset')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAsset(@Body() dto: DeleteAssetRequestDto) {
    const success = await this.storageService.deleteFile(dto.publicId);
    return {
      success,
      publicId: dto.publicId,
      message: 'Asset removed successfully.',
    };
  }

  @Get('asset')
  @UseGuards(JwtAuthGuard)
  async getAssetMetadata(@Query('publicId') publicId: string) {
    const metadata = await this.storageService.getAssetMetadata(publicId);
    return metadata ? new StorageAssetResponseDto(metadata) : null;
  }
}
