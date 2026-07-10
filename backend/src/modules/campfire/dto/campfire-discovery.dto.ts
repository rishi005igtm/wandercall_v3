import { IsEnum, IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CampfireCategory, CampfireMood, CampfireStatus, CampfireVisibility } from '../constants/campfire.constant';
import { CampfireEntity } from '../entities/campfire.entity';

export enum CampfireSortField {
  NEWEST = 'createdAt',
  OLDEST = 'createdAt_asc',
  POPULARITY = 'popularity', // dynamic score
  PARTICIPANTS = 'currentListeners',
  TRENDING = 'trending', // dynamic score
  RECENTLY_STARTED = 'startedAt',
  ALPHABETICAL = 'title',
}

export class CampfireFilterDto {
  @IsEnum(CampfireCategory)
  @IsOptional()
  category?: CampfireCategory;

  @IsEnum(CampfireMood)
  @IsOptional()
  mood?: CampfireMood;

  @IsEnum(CampfireVisibility)
  @IsOptional()
  visibility?: CampfireVisibility;

  @IsEnum(CampfireStatus)
  @IsOptional()
  status?: CampfireStatus;

  @IsUUID()
  @IsOptional()
  communityId?: string;

  @IsUUID()
  @IsOptional()
  hostId?: string;

  @IsString()
  @IsOptional()
  search?: string;
  
  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class CampfireCursorPaginationDto extends CampfireFilterDto {
  @IsString()
  @IsOptional()
  cursor?: string; // Encoded cursor (usually base64 or ISO string)

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsEnum(CampfireSortField)
  @IsOptional()
  sort?: CampfireSortField = CampfireSortField.NEWEST;
}

export interface CampfireDiscoveryResponse {
  items: CampfireEntity[];
  nextCursor?: string;
  hasNext: boolean;
}
