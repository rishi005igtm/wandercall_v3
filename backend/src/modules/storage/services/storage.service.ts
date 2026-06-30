import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UploadIntent } from '../enums/upload-intent.enum';
import { IStorageAssetMetadata } from '../interfaces/storage-asset-metadata.interface';
import { IStorageService } from '../interfaces/storage-service.interface';
import { CloudinaryProvider } from './cloudinary.provider';

interface IntentRule {
  folder: string;
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  resourceType: 'image' | 'raw' | 'video' | 'auto';
  publicIdGenerator: (entityId: string, customFilename?: string) => string;
  transformationPreset?: any;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);

  private readonly intentRules: Record<UploadIntent, IntentRule> = {
    [UploadIntent.PROFILE_AVATAR]: {
      folder: 'wandercall/users/avatars',
      maxSizeBytes: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      resourceType: 'image',
      publicIdGenerator: (userId: string) => `avatar_${userId}`,
      transformationPreset: { aspect_ratio: '1:1', gravity: 'face', crop: 'fill' },
    },
    [UploadIntent.PROFILE_BANNER]: {
      folder: 'wandercall/users/banners',
      maxSizeBytes: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      resourceType: 'image',
      publicIdGenerator: (userId: string) => `banner_${userId}`,
      transformationPreset: { aspect_ratio: '3:1', crop: 'fill' },
    },
    [UploadIntent.COMMUNITY_BANNER]: {
      folder: 'wandercall/communities/banners',
      maxSizeBytes: 10 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      resourceType: 'image',
      publicIdGenerator: (communityId: string) => `banner_${communityId}`,
    },
    [UploadIntent.COMMUNITY_THUMBNAIL]: {
      folder: 'wandercall/communities/thumbnails',
      maxSizeBytes: 5 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      resourceType: 'image',
      publicIdGenerator: (communityId: string) => `thumb_${communityId}`,
    },
    [UploadIntent.COMMUNITY_COVER]: {
      folder: 'wandercall/communities/covers',
      maxSizeBytes: 10 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      resourceType: 'image',
      publicIdGenerator: (communityId: string) => `cover_${communityId}`,
    },
    [UploadIntent.FEED_IMAGE]: {
      folder: 'wandercall/feed/images',
      maxSizeBytes: 15 * 1024 * 1024, // 15MB
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      resourceType: 'image',
      publicIdGenerator: (postId: string) => `post_${postId}_${Date.now()}`,
    },
    [UploadIntent.EXPERIENCE_IMAGE]: {
      folder: 'wandercall/experiences/gallery',
      maxSizeBytes: 15 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      resourceType: 'image',
      publicIdGenerator: (expId: string) => `exp_${expId}_${Date.now()}`,
    },
    [UploadIntent.PROVIDER_IMAGE]: {
      folder: 'wandercall/providers',
      maxSizeBytes: 10 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_IMAGE_TYPES,
      resourceType: 'image',
      publicIdGenerator: (providerId: string) => `provider_${providerId}_${Date.now()}`,
    },
    [UploadIntent.DOCUMENT]: {
      folder: 'wandercall/documents',
      maxSizeBytes: 20 * 1024 * 1024, // 20MB
      allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      resourceType: 'raw',
      publicIdGenerator: (docId: string, customFilename?: string) => customFilename ? `${docId}_${customFilename}` : `doc_${docId}_${Date.now()}`,
    },
    [UploadIntent.CERTIFICATE]: {
      folder: 'wandercall/certificates',
      maxSizeBytes: 15 * 1024 * 1024,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      resourceType: 'auto',
      publicIdGenerator: (certId: string) => `cert_${certId}_${Date.now()}`,
    },
  };

  constructor(private readonly cloudinaryProvider: CloudinaryProvider) {}

  /**
   * Validate file against upload intent rules
   */
  private validateFile(file: Express.Multer.File, rule: IntentRule) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      this.logger.warn(`File validation failed: File is empty or corrupted.`);
      throw new BadRequestException('Uploaded file is corrupted or empty.');
    }

    if (file.size > rule.maxSizeBytes) {
      const maxMb = (rule.maxSizeBytes / (1024 * 1024)).toFixed(1);
      this.logger.warn(`File validation failed: Size (${file.size} bytes) exceeds limit of ${maxMb}MB.`);
      throw new BadRequestException(`File size exceeds maximum allowed limit of ${maxMb}MB for this upload type.`);
    }

    if (!rule.allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`File validation failed: MimeType '${file.mimetype}' is not supported. Allowed: ${rule.allowedMimeTypes.join(', ')}`);
      throw new BadRequestException(`Unsupported file format (${file.mimetype}). Allowed formats: ${rule.allowedMimeTypes.join(', ')}`);
    }
  }

  /**
   * Main Upload Method
   */
  async uploadFile(
    file: Express.Multer.File,
    intent: UploadIntent,
    entityId: string,
    customFilename?: string,
  ): Promise<IStorageAssetMetadata> {
    const rule = this.intentRules[intent];
    if (!rule) {
      throw new BadRequestException(`Unknown or unsupported upload intent: ${intent}`);
    }

    this.logger.log(`Upload started: intent=${intent}, entityId=${entityId}, size=${file?.size} bytes`);
    this.validateFile(file, rule);

    const publicId = rule.publicIdGenerator(entityId, customFilename);
    const result = await this.cloudinaryProvider.uploadBuffer(
      file.buffer,
      rule.folder,
      publicId,
      rule.resourceType,
      rule.transformationPreset || {},
    );

    this.logger.log(`Upload completed: publicId=${result.publicId}, url=${result.secureUrl}`);
    return result;
  }

  /**
   * Replace File Workflow
   */
  async replaceFile(
    file: Express.Multer.File,
    oldPublicId: string,
    intent: UploadIntent,
    entityId: string,
  ): Promise<IStorageAssetMetadata> {
    this.logger.log(`Replace started: oldPublicId=${oldPublicId}, intent=${intent}`);
    
    // 1. Upload new asset
    const newAsset = await this.uploadFile(file, intent, entityId);

    // 2. If old public ID exists and is different, clean up old asset
    if (oldPublicId && oldPublicId !== newAsset.publicId) {
      try {
        const rule = this.intentRules[intent];
        await this.cloudinaryProvider.deleteAsset(oldPublicId, rule.resourceType);
        this.logger.log(`Replace completed: Old asset ${oldPublicId} deleted successfully.`);
      } catch (err: any) {
        this.logger.warn(`Failed to delete old asset ${oldPublicId} during replace flow: ${err.message}`);
      }
    }

    return newAsset;
  }

  /**
   * Delete File Workflow
   */
  async deleteFile(publicId: string): Promise<boolean> {
    this.logger.log(`Delete started for asset publicId=${publicId}`);
    const success = await this.cloudinaryProvider.deleteAsset(publicId);
    this.logger.log(`Delete completed for asset publicId=${publicId}`);
    return success;
  }

  /**
   * Fetch Asset Metadata
   */
  async getAssetMetadata(publicId: string): Promise<IStorageAssetMetadata | null> {
    return this.cloudinaryProvider.getAssetMetadata(publicId);
  }
}
