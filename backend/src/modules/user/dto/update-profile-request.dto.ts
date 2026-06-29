import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileRequestDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  avatarPublicId?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  coverImagePublicId?: string;

  @IsOptional()
  @IsString()
  locationFormatted?: string;

  @IsOptional()
  @IsString()
  phoneCoordinate?: string;
}
