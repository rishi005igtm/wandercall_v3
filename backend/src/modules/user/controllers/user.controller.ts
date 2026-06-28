import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CompleteProfileRequestDto } from '../dto/complete-profile-request.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
}
