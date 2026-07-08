import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { CommunityDiscoveryService } from '../services/community-discovery.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('discovery/communities')
export class CommunityDiscoveryController {
  constructor(private readonly discoveryService: CommunityDiscoveryService) {}

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    if (!query) return [];
    return this.discoveryService.searchCommunities(query, limit, cursor);
  }

  @Get('galaxy')
  async getGalaxy(
    @Query('categoryId') categoryId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit?: number,
  ) {
    return this.discoveryService.getGalaxyClusters(categoryId, cursor, limit);
  }

  @Get('categories')
  async getCategories() {
    return this.discoveryService.getCategories();
  }

  @Get('coordinates')
  async getCoordinates(@Query('categoryId') categoryId?: string) {
    return this.discoveryService.getCoordinates(categoryId);
  }
}
