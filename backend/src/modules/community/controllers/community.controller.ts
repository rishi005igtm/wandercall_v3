import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Put,
  Param,
  Body,
  Query,
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
import { CommunityAuditService } from '../services/community-audit.service';
import { CommunityStatisticsService } from '../services/community-statistics.service';
import { CommunityRoleService } from '../services/community-role.service';
import { CommunityStoryService } from '../services/community-story.service';
import { CreateCommunityDto } from '../dto/create-community.dto';
import { UpdateCommunityDto } from '../dto/update-community.dto';
import { UpdateCommunitySettingsDto } from '../dto/update-community-settings.dto';
import { RequestWithUser } from '../../../core/interfaces/request-with-user.interface';

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  accountStatus: string;
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user as unknown as AuthUser;
  },
);

@UseGuards(JwtAuthGuard)
@Controller('communities')
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly membershipService: CommunityMembershipService,
    private readonly inviteService: CommunityInviteService,
    private readonly auditService: CommunityAuditService,
    private readonly statisticsService: CommunityStatisticsService,
    private readonly roleService: CommunityRoleService,
    private readonly storyService: CommunityStoryService,
  ) {}

  @Post()
  async createCommunity(
    @GetUser() user: AuthUser,
    @Body() dto: CreateCommunityDto,
  ) {
    return this.communityService.createCommunity(user.userId, dto);
  }

  @Get('me')
  async getMyCommunities(@GetUser() user: AuthUser) {
    return this.communityService.getUserCommunities(user.userId);
  }

  @Get('roles/all')
  async getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Post('roles')
  async createRole(
    @Body()
    body: {
      name: string;
      displayName: string;
      displayColor?: string;
      priority?: number;
      permissions?: string[];
    },
  ) {
    return this.roleService.createCustomRole(body);
  }

  @Patch('roles/:roleId')
  async updateRole(
    @Param('roleId') roleId: string,
    @Body()
    body: {
      displayName?: string;
      displayColor?: string;
      priority?: number;
      permissions?: string[];
    },
  ) {
    return this.roleService.updateRole(roleId, body);
  }

  @Delete('roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param('roleId') roleId: string) {
    return this.roleService.deleteRole(roleId);
  }

  @Post('invites/:inviteId/accept')
  async acceptInvite(
    @GetUser() user: AuthUser,
    @Param('inviteId') inviteId: string,
  ) {
    return this.inviteService.acceptInvite(inviteId, user.userId);
  }

  @Post('invites/:inviteId/decline')
  async declineInvite(
    @GetUser() user: AuthUser,
    @Param('inviteId') inviteId: string,
  ) {
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

  @Get(':id/audit-logs')
  async getAuditLogs(
    @Param('id') id: string,
    @Query('actorId') actorId?: string,
    @Query('targetUserId') targetUserId?: string,
    @Query('action') action?: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.auditService.getLogs(id, {
      actorId,
      targetUserId,
      action,
      limit: limit ? Number(limit) : 30,
      cursor,
    });
  }

  @Get(':id/analytics')
  async getAnalytics(@Param('id') id: string, @GetUser() user: AuthUser) {
    return this.statisticsService.getAnalytics(id, user.userId);
  }

  @Get(':id/stories')
  async getStories(
    @Param('id') id: string,
    @Query('category') category?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.storyService.getCommunityStories(id, {
      category,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Patch(':id/stories/:storyId/pin')
  async pinStory(
    @Param('id') id: string,
    @Param('storyId') storyId: string,
    @Body() body: { isPinned?: boolean },
    @GetUser() user: AuthUser,
  ) {
    return this.storyService.pinStory(
      id,
      user.userId,
      storyId,
      body.isPinned ?? true,
    );
  }

  @Patch(':id/stories/:storyId/feature')
  async featureStory(
    @Param('id') id: string,
    @Param('storyId') storyId: string,
    @Body() body: { isFeatured?: boolean },
    @GetUser() user: AuthUser,
  ) {
    return this.storyService.featureStory(
      id,
      user.userId,
      storyId,
      body.isFeatured ?? true,
    );
  }

  @Delete(':id/stories/:storyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStory(
    @Param('id') id: string,
    @Param('storyId') storyId: string,
    @Body() body: { reason?: string },
    @GetUser() user: AuthUser,
  ) {
    return this.storyService.deleteStory(id, user.userId, storyId, body.reason);
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
