import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UploadIntent } from '../enums/upload-intent.enum';

export class ReplaceAssetRequestDto {
  @IsString()
  @IsNotEmpty()
  oldPublicId: string;

  @IsEnum(UploadIntent)
  @IsNotEmpty()
  intent: UploadIntent;

  @IsString()
  @IsNotEmpty()
  entityId: string;
}
