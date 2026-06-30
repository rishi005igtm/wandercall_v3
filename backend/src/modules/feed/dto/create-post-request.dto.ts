import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PostVisibility } from '../entities/post.entity';

export class CreatePostRequestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @MinLength(50, { message: 'Story details must be at least 50 characters long.' })
  content: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationLon?: number;

}
