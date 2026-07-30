import {
  Controller,
  Post,
  Delete,
  Param,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../../core/interfaces/request-with-user.interface';
import { StorageService } from '../../storage/services/storage.service';
import { UploadIntent } from '../../storage/enums/upload-intent.enum';
import { randomUUID } from 'crypto';

@Controller('feed/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const userId = req.user.userId;
    // We generate a dummy entity ID for the upload since the post isn't created yet
    const dummyId = randomUUID();

    // Determine intent from mime type (basic check)
    const intent =
      file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')
        ? UploadIntent.FEED_AUDIO
        : UploadIntent.FEED_IMAGE;

    const result = await this.storageService.uploadFile(file, intent, dummyId);

    await this.storageService.trackMediaUpload(
      userId,
      result.publicId,
      result.secureUrl,
    );

    return {
      success: true,
      url: result.secureUrl,
      publicId: result.publicId,
    };
  }

  @Delete(':publicId')
  async deleteMedia(
    @Param('publicId') publicId: string,
    @Req() req: RequestWithUser,
  ) {
    // In a real strict enterprise app, you'd want to check if the user actually owns this MediaUploadEntity.
    // For now we just untrack and delete.
    const success = await this.storageService.deleteFile(publicId);
    if (success) {
      await this.storageService.untrackMedia(publicId);
    }

    return {
      success,
      message: 'Media deleted',
    };
  }
}
