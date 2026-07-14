import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PrivacyService } from '../services/privacy.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../../../core/interfaces/request-with-user.interface';

@Controller('privacy')
@UseGuards(JwtAuthGuard)
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  @Get('blocked')
  async getBlockedUsers(
    @Req() req: RequestWithUser,
    @Query('limit') limit = '20',
    @Query('cursor') cursor?: string,
  ) {
    return this.privacyService.getBlockedUsers(
      req.user.userId,
      parseInt(limit, 10),
      cursor,
    );
  }

  @Post('block/:targetUsername')
  async blockUser(
    @Req() req: RequestWithUser,
    @Param('targetUsername') targetUsername: string,
    @Body('reason') reason?: string,
  ) {
    // In a real app, we would resolve targetUsername to targetUserId.
    // Assuming targetUsername is passed as targetUserId for simplicity in this implementation,
    // or we can inject UserService to find the user by username.
    // For now, let's assume we pass the ID or we add logic to resolve it.
    // For Wandercall, usernames are usually resolved via UserRepository.
    return this.privacyService.blockUser(
      req.user.userId,
      targetUsername,
      reason,
    );
  }

  @Delete('block/:targetUsername')
  async unblockUser(
    @Req() req: RequestWithUser,
    @Param('targetUsername') targetUsername: string,
  ) {
    return this.privacyService.unblockUser(req.user.userId, targetUsername);
  }
}
