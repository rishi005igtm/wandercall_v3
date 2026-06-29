import { IStorageAssetMetadata } from '../interfaces/storage-asset-metadata.interface';

export class StorageAssetResponseDto implements IStorageAssetMetadata {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
  version: number;
  folder: string;
  originalFilename?: string;
  createdTimestamp: string;

  constructor(metadata: IStorageAssetMetadata) {
    Object.assign(this, metadata);
  }
}
