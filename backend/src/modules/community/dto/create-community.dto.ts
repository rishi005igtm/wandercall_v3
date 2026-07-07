import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { CommunityVisibility } from '../constants/community.constant';

export class CreateCommunityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  slug: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  primaryCategoryId: string;

  @IsEnum(CommunityVisibility)
  @IsOptional()
  visibility?: CommunityVisibility;

  @IsUUID()
  @IsOptional()
  coordinateId?: string;

  @IsString()
  @IsOptional()
  coordinateName?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  cover?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  invitedUserIds?: string[];
}
