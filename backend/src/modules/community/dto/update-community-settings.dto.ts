import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CommunityJoinPolicy } from '../constants/community.constant';

export class UpdateCommunitySettingsDto {
  @IsBoolean()
  @IsOptional()
  approvalRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  public?: boolean;

  @IsBoolean()
  @IsOptional()
  private?: boolean;

  @IsBoolean()
  @IsOptional()
  hidden?: boolean;

  @IsBoolean()
  @IsOptional()
  allowInvite?: boolean;

  @IsBoolean()
  @IsOptional()
  allowStories?: boolean;

  @IsBoolean()
  @IsOptional()
  allowChat?: boolean;

  @IsBoolean()
  @IsOptional()
  discoverable?: boolean;

  @IsEnum(CommunityJoinPolicy)
  @IsOptional()
  joinPolicy?: CommunityJoinPolicy;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  region?: string;
}
