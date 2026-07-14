import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  CampfireCategory,
  CampfireMood,
  CampfireStatus,
  CampfireVisibility,
} from '../constants/campfire.constant';

export class UpdateCampfireDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

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

  @IsString()
  @IsOptional()
  livekitRoom?: string;
}
