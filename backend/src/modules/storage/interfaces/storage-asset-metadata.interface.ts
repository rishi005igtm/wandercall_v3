export interface IStorageAssetMetadata {
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
}
