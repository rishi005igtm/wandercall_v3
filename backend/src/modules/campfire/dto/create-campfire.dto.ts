import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { CampfireCategory, CampfireMood, CampfireStatus, CampfireVisibility } from '../constants/campfire.constant';


export class CreateCampfireDto {
  @IsUUID()
  @IsOptional()
  communityId?: string;


  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().replace(/ /g, '_') : value))
  @IsEnum(CampfireCategory)
  @IsOptional()
  category?: CampfireCategory;

  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase().replace(/ /g, '_') : value))
  @IsEnum(CampfireMood)
  @IsOptional()
  mood?: CampfireMood;

  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(CampfireVisibility)
  @IsOptional()
  visibility?: CampfireVisibility;

  @IsEnum(CampfireStatus)
  @IsOptional()
  status?: CampfireStatus;

  @IsString()
  @IsOptional()
  scheduledStartAt?: string;
}

