import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CompleteProfileRequestDto } from '../dto/complete-profile-request.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { UpdateProfileRequestDto } from '../dto/update-profile-request.dto';
import { UserSettingsDto } from '../dto/user-settings-dto';
import { UserPlanDto } from '../dto/user-plan-dto';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { FollowService } from '../services/follow.service';
import { PublicProfileResponseDto } from '../dto/public-profile-response.dto';
import { RelationshipResponseDto } from '../dto/relationship-response.dto';
import { FollowerPreviewDto } from '../dto/follower-preview.dto';
import { RequestWithUser } from '../../../core/interfaces/request-with-user.interface';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(
    @Req() req: RequestWithUser,
  ): Promise<UserProfileResponseDto> {
    return this.userService.getProfileByUserId(req.user.userId);
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(
    @Req() req: RequestWithUser,
  ): Promise<UserProfileResponseDto> {
    return this.userService.getProfileByUserId(req.user.userId);
  }

  @Get('settings/me')
  @UseGuards(JwtAuthGuard)
  async getMySettings(@Req() req: RequestWithUser): Promise<UserSettingsDto> {
    return this.userService.getSettings(req.user.userId);
  }

  @Get('plan/me')
  @UseGuards(JwtAuthGuard)
  async getMyPlan(@Req() req: RequestWithUser): Promise<UserPlanDto> {
    return this.userService.getPlan(req.user.userId);
  }

  @Post('profile/complete')
  @HttpCode(HttpStatus.OK)
  async completeProfile(
    @Body() dto: CompleteProfileRequestDto,
  ): Promise<UserProfileResponseDto> {
    return this.userService.completeProfile(dto);
  }

  @Get('username/check')
  async checkUsername(
    @Query('username') username: string,
  ): Promise<{ available: boolean; username: string }> {
    return this.userService.checkUsernameAvailability(username || '');
  }

  @Get('username/suggestions')
  async getUsernameSuggestions(
    @Query('name') name: string,
  ): Promise<{ suggestions: string[] }> {
    const suggestions = await this.userService.generateUsernameSuggestions(
      name || 'Explorer',
    );
    return { suggestions };
  }

  @Get('profile/:userId')
  async getProfile(
    @Param('userId') userId: string,
  ): Promise<UserProfileResponseDto> {
    return this.userService.getProfileByUserId(userId);
  }

  @Patch('profile/me')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileRequestDto,
  ): Promise<UserProfileResponseDto> {
    return this.userService.updateProfile(req.user.userId, dto);
  }

  @Patch('profile/:userId')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: RequestWithUser,
    @Param('userId') userId: string,
    @Body() dto: UpdateProfileRequestDto,
  ): Promise<UserProfileResponseDto> {
    const targetId = req.user?.userId || userId;
    return this.userService.updateProfile(targetId, dto);
  }

  @Post('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMyAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserProfileResponseDto> {
    return this.userService.uploadAvatar(req.user.userId, file);
  }

  @Post('profile/cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMyCoverImage(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserProfileResponseDto> {
    return this.userService.uploadCoverImage(req.user.userId, file);
  }

  @Get('settings/:userId')
  async getSettings(@Param('userId') userId: string): Promise<UserSettingsDto> {
    return this.userService.getSettings(userId);
  }

  @Patch('settings/me')
  @UseGuards(JwtAuthGuard)
  async updateMySettings(
    @Req() req: RequestWithUser,
    @Body() partial: Partial<UserSettingsDto>,
  ): Promise<UserSettingsDto> {
    return this.userService.updateSettings(req.user.userId, partial);
  }

  @Patch('settings/:userId')
  @UseGuards(JwtAuthGuard)
  async updateSettings(
    @Req() req: RequestWithUser,
    @Param('userId') userId: string,
    @Body() partial: Partial<UserSettingsDto>,
  ): Promise<UserSettingsDto> {
    const targetId = req.user?.userId || userId;
    return this.userService.updateSettings(targetId, partial);
  }

  @Get('plan/:userId')
  async getPlan(@Param('userId') userId: string): Promise<UserPlanDto> {
    return this.userService.getPlan(userId);
  }

  @Patch('plan/me')
  @UseGuards(JwtAuthGuard)
  async updateMyPlan(
    @Req() req: RequestWithUser,
    @Body() partial: Partial<UserPlanDto>,
  ): Promise<UserPlanDto> {
    return this.userService.updatePlan(req.user.userId, partial);
  }

  @Patch('plan/:userId')
  @UseGuards(JwtAuthGuard)
  async updatePlan(
    @Req() req: RequestWithUser,
    @Param('userId') userId: string,
    @Body() partial: Partial<UserPlanDto>,
  ): Promise<UserPlanDto> {
    const targetId = req.user?.userId || userId;
    return this.userService.updatePlan(targetId, partial);
  }

  @Get('profile/username/:username')
  @UseGuards(OptionalJwtAuthGuard)
  async getPublicProfile(
    @Req() req: RequestWithUser,
    @Param('username') username: string,
  ): Promise<PublicProfileResponseDto> {
    const currentUserId = req.user?.userId || null;
    return this.userService.getPublicProfileByUsername(username, currentUserId);
  }

  @Get('relationship/:username')
  @UseGuards(JwtAuthGuard)
  async getRelationshipState(
    @Req() req: RequestWithUser,
    @Param('username') username: string,
  ): Promise<RelationshipResponseDto> {
    return this.followService.getRelationshipState(req.user.userId, username);
  }

  @Post('follow/:username')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async followUser(
    @Req() req: RequestWithUser,
    @Param('username') username: string,
  ): Promise<RelationshipResponseDto> {
    return this.followService.followUser(req.user.userId, username);
  }

  @Post('unfollow/:username')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unfollowUser(
    @Req() req: RequestWithUser,
    @Param('username') username: string,
  ): Promise<RelationshipResponseDto> {
    return this.followService.unfollowUser(req.user.userId, username);
  }

  @Get('/:username/followers')
  async getFollowers(
    @Param('username') username: string,
    @Query('limit') limit = '10',
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    const parsedLimit = parseInt(limit, 10) || 10;
    return this.followService.getFollowers(
      username,
      parsedLimit,
      cursor,
      search,
    );
  }

  @Get('/:username/following')
  async getFollowing(
    @Param('username') username: string,
    @Query('limit') limit = '10',
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    const parsedLimit = parseInt(limit, 10) || 10;
    return this.followService.getFollowing(
      username,
      parsedLimit,
      cursor,
      search,
    );
  }
}
