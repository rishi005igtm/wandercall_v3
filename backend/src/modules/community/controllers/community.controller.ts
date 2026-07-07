import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommunityService } from '../services/community.service';
import { CommunityMembershipService } from '../services/community-membership.service';
import { CommunityInviteService } from '../services/community-invite.service';
import { CreateCommunityDto } from '../dto/create-community.dto';
import { UpdateCommunityDto } from '../dto/update-community.dto';
import { UpdateCommunitySettingsDto } from '../dto/update-community-settings.dto';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  accountStatus: string;
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

@UseGuards(JwtAuthGuard)
@Controller('communities')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly membershipService: CommunityMembershipService,
    private readonly inviteService: CommunityInviteService,
  ) {}

  @Post()
  async createCommunity(@GetUser() user: AuthUser, @Body() dto: CreateCommunityDto) {
    return this.communityService.createCommunity(user.userId, dto);
  }

  @Get('me')
  async getMyCommunities(@GetUser() user: AuthUser) {
    return this.communityService.getUserCommunities(user.userId);
  }

  @Post('invites/:inviteId/accept')
  async acceptInvite(@GetUser() user: AuthUser, @Param('inviteId') inviteId: string) {
    return this.inviteService.acceptInvite(inviteId, user.userId);
  }

  @Post('invites/:inviteId/decline')
  async declineInvite(@GetUser() user: AuthUser, @Param('inviteId') inviteId: string) {
    return this.inviteService.declineInvite(inviteId, user.userId);
  }

  @Get(':slug')
  async getCommunityBySlug(@Param('slug') slug: string) {
    return this.communityService.getCommunityBySlug(slug);
  }

  @Patch(':id')
  async updateCommunity(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.communityService.updateCommunity(id, user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCommunity(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.communityService.deleteCommunity(id, user.userId);
  }

  @Get(':id/settings')
  async getSettings(@Param('id') id: string) {
    return this.communityService.getSettings(id);
  }

  @Patch(':id/settings')
  async updateSettings(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCommunitySettingsDto,
  ) {
    return this.communityService.updateSettings(id, user.userId, dto);
  }

  @Post(':id/join')
  async joinCommunity(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.membershipService.joinCommunity(id, user.userId);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveCommunity(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.membershipService.leaveCommunity(id, user.userId);
  }
}
