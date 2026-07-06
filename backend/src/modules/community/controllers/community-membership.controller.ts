import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser, AuthUser } from './community.controller';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CommunityMembershipService } from '../services/community-membership.service';
import { CommunityInviteService } from '../services/community-invite.service';
import { UserSearchService } from '../../search/services/user-search.service';

@Controller('communities/:communityId/members')
@UseGuards(JwtAuthGuard)
export class CommunityMembershipController {
  constructor(
    private readonly membershipService: CommunityMembershipService,
    private readonly inviteService: CommunityInviteService,
    private readonly userSearchService: UserSearchService,
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
    @CurrentUser('userId') requesterId: string,
  ) {
    return this.membershipService.kickMember(communityId, requesterId, targetUserId);
  }

  @Post(':targetUserId/ban')
  async banMember(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body: { reason?: string; permanent?: boolean; expiresAt?: string },
    @CurrentUser('userId') requesterId: string,
  ) {
    return this.membershipService.banMember(
      communityId,
      requesterId,
      targetUserId,
      body.reason,
      body.permanent ?? true,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
    );
  }

  @Post(':targetUserId/mute')
  async muteMember(
    @Param('communityId') communityId: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body: { durationMinutes: number },
    @CurrentUser('userId') requesterId: string,
  ) {
    return this.membershipService.muteMember(communityId, requesterId, targetUserId, body.durationMinutes);
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
    @Body() body: { roleId: string },
    @CurrentUser('userId') requesterId: string,
  ) {
    return this.membershipService.updateRole(communityId, requesterId, targetUserId, body.roleId);
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
