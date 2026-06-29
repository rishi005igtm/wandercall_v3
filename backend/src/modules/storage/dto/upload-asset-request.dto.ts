import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UploadIntent } from '../enums/upload-intent.enum';

export class UploadAssetRequestDto {
  @IsEnum(UploadIntent)
  @IsNotEmpty()
  intent: UploadIntent;

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsOptional()
  @IsString()
  customFilename?: string;
}
