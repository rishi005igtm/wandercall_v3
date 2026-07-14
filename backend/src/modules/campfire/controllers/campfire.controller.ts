import { Request } from 'express';
export interface AuthRequest extends Request {
  user: {
    userId: string;
    id?: string;
    displayName?: string;
    authName?: string;
    avatarUrl?: string;
    [key: string]: unknown;
  };
}

import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CampfireService } from '../services/campfire.service';
import { CreateCampfireDto } from '../dto/create-campfire.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LivekitService } from '../services/livekit.service';

@UseGuards(JwtAuthGuard)
@Controller('campfires')
export class CampfireController {
  constructor(
    private readonly campfireService: CampfireService,
    private readonly livekitService: LivekitService,
  ) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateCampfireDto) {
    const userId = (req.user.userId || req.user.id) as string;
    return this.campfireService.create(userId, dto);
  }

  @Get('live')
  async getLive(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.campfireService.getLiveCampfires(limit, offset);
  }

  @Get('search')
  async search(@Query() query: Record<string, unknown>) {
    return this.campfireService.search(query);
  }

  @Get('workspace/:tab')
  async getWorkspace(
    @Req() req: AuthRequest,
    @Param('tab') tab: 'hosted' | 'joined' | 'saved',
  ) {
    const userId = (req.user.userId || req.user.id) as string;
    return this.campfireService.getWorkspace(userId, tab);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.campfireService.findById(id);
  }

  @Delete(':id')
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = (req.user.userId || req.user.id) as string;
    await this.campfireService.softDelete(id, userId);
    return { success: true };
  }

  @Post(':id/join-session')
  async joinSession(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = (req.user.userId || req.user.id) as string;
    const name = (req.user.name ||
      req.user.displayName ||
      'Explorer') as string;
    const campfire = await this.campfireService.findById(id);

    // The role at join is primarily Listener unless host.
    // If they later take a seat, the gateway updates their permissions on the LiveKit server.
    const isHost = campfire.hostId === userId;
    const role = isHost ? 'Host' : 'Listener';

    const { token, roomName } = await this.livekitService.generateToken(
      id,
      userId,
      role,
      name,
    );
    const wsUrl = this.livekitService.getWsUrl();

    // --- TEMPORARY AUDIT LOG (Phase 2) ---
    // -------------------------------------

    return {
      token,
      wsUrl,
      roomName,
    };
  }

  @Post(':id/end')
  async endSession(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = (req.user.userId || req.user.id) as string;
    return this.campfireService.endSession(id, userId);
  }

  @Post(':id/start')
  async startSession(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = (req.user.userId || req.user.id) as string;
    return this.campfireService.restartSession(id, userId);
  }

  @Post(':id/restart')
  async restartSession(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = (req.user.userId || req.user.id) as string;
    return this.campfireService.restartSession(id, userId);
  }
}
