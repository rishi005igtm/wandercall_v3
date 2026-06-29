import { UploadIntent } from '../enums/upload-intent.enum';
import { IStorageAssetMetadata } from './storage-asset-metadata.interface';

export interface IStorageService {
  uploadFile(
    file: Express.Multer.File,
    intent: UploadIntent,
    entityId: string,
    customFilename?: string,
  ): Promise<IStorageAssetMetadata>;

  replaceFile(
    file: Express.Multer.File,
    oldPublicId: string,
    intent: UploadIntent,
    entityId: string,
  ): Promise<IStorageAssetMetadata>;

  deleteFile(publicId: string): Promise<boolean>;

  getAssetMetadata(publicId: string): Promise<IStorageAssetMetadata | null>;
}
