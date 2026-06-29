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
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CompleteProfileRequestDto } from '../dto/complete-profile-request.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { UpdateProfileRequestDto } from '../dto/update-profile-request.dto';
import { UserSettingsDto } from '../dto/user-settings-dto';
import { UserPlanDto } from '../dto/user-plan-dto';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: any): Promise<UserProfileResponseDto> {
    return this.userService.getProfileByUserId(req.user.userId);
  }

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() req: any): Promise<UserProfileResponseDto> {
    return this.userService.getProfileByUserId(req.user.userId);
  }

  @Get('settings/me')
  @UseGuards(JwtAuthGuard)
  async getMySettings(@Req() req: any): Promise<UserSettingsDto> {
    return this.userService.getSettings(req.user.userId);
  }

  @Get('plan/me')
  @UseGuards(JwtAuthGuard)
  async getMyPlan(@Req() req: any): Promise<UserPlanDto> {
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
    const suggestions = await this.userService.generateUsernameSuggestions(name || 'Explorer');
    return { suggestions };
  }

  @Get('profile/:userId')
  async getProfile(@Param('userId') userId: string): Promise<UserProfileResponseDto> {
    return this.userService.getProfileByUserId(userId);
  }

  @Patch('profile/me')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileRequestDto,
  ): Promise<UserProfileResponseDto> {
    return this.userService.updateProfile(req.user.userId, dto);
  }

  @Patch('profile/:userId')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() dto: UpdateProfileRequestDto,
  ): Promise<UserProfileResponseDto> {
    const targetId = req.user?.userId || userId;
    return this.userService.updateProfile(targetId, dto);
  }

  @Get('settings/:userId')
  async getSettings(@Param('userId') userId: string): Promise<UserSettingsDto> {
    return this.userService.getSettings(userId);
  }

  @Patch('settings/me')
  @UseGuards(JwtAuthGuard)
  async updateMySettings(
    @Req() req: any,
    @Body() partial: Partial<UserSettingsDto>,
  ): Promise<UserSettingsDto> {
    return this.userService.updateSettings(req.user.userId, partial);
  }

  @Patch('settings/:userId')
  @UseGuards(JwtAuthGuard)
  async updateSettings(
    @Req() req: any,
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
    @Req() req: any,
    @Body() partial: Partial<UserPlanDto>,
  ): Promise<UserPlanDto> {
    return this.userService.updatePlan(req.user.userId, partial);
  }

  @Patch('plan/:userId')
  @UseGuards(JwtAuthGuard)
  async updatePlan(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() partial: Partial<UserPlanDto>,
  ): Promise<UserPlanDto> {
    const targetId = req.user?.userId || userId;
    return this.userService.updatePlan(targetId, partial);
  }
}
