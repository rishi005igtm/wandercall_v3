import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAssetRequestDto {
  @IsString()
  @IsNotEmpty()
  publicId: string;
}
