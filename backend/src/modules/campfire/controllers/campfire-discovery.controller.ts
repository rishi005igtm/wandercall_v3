import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CampfireDiscoveryService } from '../services/campfire-discovery.service';
import { CampfireCursorPaginationDto } from '../dto/campfire-discovery.dto';
import { GetUser, AuthUser } from './campfire.controller';

@UseGuards(JwtAuthGuard)
@Controller('campfires')
export class CampfireDiscoveryController {
  constructor(private readonly discoveryService: CampfireDiscoveryService) {}

  @Get('search')
  async search(@Query() query: CampfireCursorPaginationDto) {
    return this.discoveryService.search(query);
  }

  @Get('trending')
  async getTrending(@Query() query: CampfireCursorPaginationDto) {
    return this.discoveryService.getTrending(query);
  }

  @Get('live')
  async getLive(@Query() query: CampfireCursorPaginationDto) {
    return this.discoveryService.getLive(query);
  }

  @Get('recommended')
  async getRecommended(@GetUser() user: AuthUser, @Query() query: CampfireCursorPaginationDto) {
    return this.discoveryService.getRecommended(user.userId, query);
  }
}
