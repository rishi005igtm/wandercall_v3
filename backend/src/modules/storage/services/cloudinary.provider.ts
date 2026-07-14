import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from 'cloudinary';
import { Readable } from 'stream';
import { IStorageAssetMetadata } from '../interfaces/storage-asset-metadata.interface';

@Injectable()
export class CloudinaryProvider {
  private readonly logger = new Logger(CloudinaryProvider.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>(
      'storage.cloudinary.cloudName',
    );
    const apiKey = this.configService.get<string>('storage.cloudinary.apiKey');
    const apiSecret = this.configService.get<string>(
      'storage.cloudinary.apiSecret',
    );

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    } else {
      const cloudinaryUrl = this.configService.get<string>(
        'storage.cloudinary.url',
      );
      if (cloudinaryUrl) {
        cloudinary.config({
          cloudinary_url: cloudinaryUrl,
          secure: true,
        });
      } else {
        this.logger.warn(
          'Cloudinary credentials not found in configuration. Cloud storage operations will fail.',
        );
      }
    }
  }

  /**
   * Upload file buffer to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string,
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto',
    transformationOptions: UploadApiOptions = {},
  ): Promise<IStorageAssetMetadata> {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const uploadOptions: UploadApiOptions = {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: resourceType,
        quality: 'auto',
        fetch_format: 'auto',
        ...transformationOptions,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            this.logger.error(
              `Cloudinary upload failed for folder=${folder}, publicId=${publicId}: ${error?.message}`,
              error?.stack,
            );
            return reject(
              new InternalServerErrorException('Cloud storage upload failed.'),
            );
          }

          const metadata: IStorageAssetMetadata = {
            publicId: result.public_id,
            secureUrl: result.secure_url,
            resourceType: result.resource_type,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            version: result.version,
            folder: folder,
            originalFilename: result.original_filename,
            createdTimestamp: result.created_at || new Date().toISOString(),
          };

          resolve(metadata);
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  /**
   * Delete asset from Cloudinary by publicId
   */
  async deleteAsset(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'image',
  ): Promise<boolean> {
    try {
      const result: { result: string } = await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: resourceType,
          invalidate: true,
        },
      );
      return result.result === 'ok' || result.result === 'not found';
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        'Cloud storage asset deletion failed.',
      );
    }
  }

  /**
   * Fetch asset metadata from Cloudinary
   */
  async getAssetMetadata(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'image',
  ): Promise<IStorageAssetMetadata | null> {
    try {
      const resource = (await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      })) as {
        public_id: string;
        secure_url: string;
        resource_type: string;
        width: number;
        height: number;
        format: string;
        bytes: number;
        version: number;
        folder?: string;
        created_at: string;
      };
      return {
        publicId: resource.public_id,
        secureUrl: resource.secure_url,
        resourceType: resource.resource_type,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        bytes: resource.bytes,
        version: resource.version,
        folder: resource.folder || '',
        createdTimestamp: resource.created_at,
      };
    } catch (error: unknown) {
      const err = error as { http_code?: number; message?: string };
      if (err?.http_code === 404) {
        return null;
      }
      this.logger.error(
        `Cloudinary metadata fetch failed for publicId=${publicId}: ${err?.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to fetch cloud asset metadata.',
      );
    }
  }
}
