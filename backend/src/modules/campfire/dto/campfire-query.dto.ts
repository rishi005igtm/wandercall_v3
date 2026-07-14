import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CampfireCategory,
  CampfireMood,
  CampfireStatus,
} from '../constants/campfire.constant';

export class CampfireQueryDto {
  @IsUUID()
  @IsOptional()
  communityId?: string;

  @IsUUID()
  @IsOptional()
  hostId?: string;

  @IsEnum(CampfireStatus)
  @IsOptional()
  status?: CampfireStatus;

  @IsEnum(CampfireCategory)
  @IsOptional()
  category?: CampfireCategory;

  @IsEnum(CampfireMood)
  @IsOptional()
  mood?: CampfireMood;

  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @IsString()
  @IsOptional()
  savedByUserId?: string;

  @IsString()
  @IsOptional()
  participantUserId?: string;
}
