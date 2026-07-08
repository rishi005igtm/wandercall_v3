import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CommunityMembershipService } from '../services/community-membership.service';
import { CommunityInviteService } from '../services/community-invite.service';
import { UserSearchService } from '../../search/services/user-search.service';
import { CommunityModerationService } from '../services/community-moderation.service';
import { CommunityRoleService } from '../services/community-role.service';

@Controller('communities/:communityId/members')
@UseGuards(JwtAuthGuard)
export class CommunityMembershipController {
  constructor(
    private readonly membershipService: CommunityMembershipService,
    private readonly inviteService: CommunityInviteService,
    private readonly userSearchService: UserSearchService,
    private readonly moderationService: CommunityModerationService,
    private readonly roleService: CommunityRoleService,
  ) {}

  @Post('join')
  async joinCommunity(@Param('communityId') communityId: string, @CurrentUser('userId') userId: string) {
    return this.membershipService.joinCommunity(communityId, userId);
  }

  @Post('leave')
  async leaveCommunity(@Param('communityId') communityId: string, @CurrentUser('userId') userId: string) {
    return this.membershipService.leaveCommunity(communityId, userId);
  }

  @Post('invite/:targetUserId')
  async inviteMember(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @CurrentUser('userId') senderId: string,
  ) {
    return this.inviteService.sendInvite(communityId, senderId, targetUserId);
  }

  @Delete(':targetUserId/kick')
  async kickMember(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Query('reason') reason?: string,
    @CurrentUser('userId') requesterId?: string,
  ) {
    return this.moderationService.kickMember(communityId, requesterId!, targetUserId, reason || 'Kicked from community');
  }

  @Post(':targetUserId/warn')
  async warnMember(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body?: { reason?: string },
    @CurrentUser('userId') requesterId?: string,
  ) {
    return this.moderationService.warnMember(communityId, requesterId!, targetUserId, body?.reason || 'Community guideline warning');
  }

  @Post(':targetUserId/ban')
  async banMember(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body?: { reason?: string; permanent?: boolean; durationMinutes?: number; expiresAt?: string },
    @CurrentUser('userId') requesterId?: string,
  ) {
    let durationMinutes = body?.durationMinutes;
    if (!durationMinutes && body?.expiresAt) {
      durationMinutes = Math.round((new Date(body.expiresAt).getTime() - Date.now()) / 60000);
    }
    return this.moderationService.banMember(
      communityId,
      requesterId!,
      targetUserId,
      body?.reason || 'Banned from community',
      body?.permanent ?? true,
      durationMinutes,
    );
  }

  @Post(':targetUserId/unban')
  async unbanMember(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body?: { reason?: string },
    @CurrentUser('userId') requesterId?: string,
  ) {
    return this.moderationService.unbanMember(communityId, requesterId!, targetUserId, body?.reason || 'Ban lifted');
  }

  @Post(':targetUserId/mute')
  async muteMember(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body?: { durationMinutes?: number; reason?: string },
    @CurrentUser('userId') requesterId?: string,
  ) {
    return this.moderationService.muteMember(
      communityId,
      requesterId!,
      targetUserId,
      body?.durationMinutes || 15,
      body?.reason || 'Temporarily muted',
    );
  }

  @Post(':targetUserId/unmute')
  async unmuteMember(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body?: { reason?: string },
    @CurrentUser('userId') requesterId?: string,
  ) {
    return this.moderationService.unmuteMember(communityId, requesterId!, targetUserId, body?.reason || 'Mute lifted');
  }

  @Get(':targetUserId/history')
  async getMemberHistory(@Param('communityId') communityId: string, @Param('targetUserId') targetUserId: string) {
    return this.moderationService.getMemberHistory(communityId, targetUserId);
  }

  @Put('transfer-ownership')
  async transferOwnership(
    @Param('communityId') communityId: string,
    @Body() body: { newOwnerId: string },
    @CurrentUser('userId') currentOwnerId: string,
  ) {
    return this.membershipService.transferOwnership(communityId, currentOwnerId, body.newOwnerId);
  }

  @Put(':targetUserId/role')
  async updateRole(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body?: { roleId?: string; reason?: string },
    @CurrentUser('userId') requesterId?: string,
  ) {
    return this.roleService.assignRole(communityId, requesterId!, targetUserId, body?.roleId || 'MEMBER', body?.reason);
  }

  @Get('search')
  async searchMembers(
    @Param('communityId') communityId: string,
    @Query('q') q: string,
    @Query('limit') limit: number,
    @Query('cursor') cursor: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.userSearchService.searchCommunityMembers(communityId, userId, { q, limit, cursor });
  }
}
