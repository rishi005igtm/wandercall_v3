import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserSearchService } from '../services/user-search.service';
import { SocialDiscoveryService } from '../services/social-discovery.service';
import { RequestWithUser } from '../../../core/interfaces/request-with-user.interface';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    private readonly searchService: UserSearchService,
    private readonly discoveryService: SocialDiscoveryService,
  ) {}

  @Get('users')
  async searchUsers(
    @Req() req: RequestWithUser,
    @Query('q') q?: string,
    @Query('query') query?: string,
    @Query('limit') limit = '20',
    @Query('cursor') cursor?: string,
    @Query('filter') filter?: string,
  ) {
    const searchQuery = (q || query || '').trim().toLowerCase();
    // 0 characters -> return AI friend recommendations instead of hitting search engine!
    if (searchQuery.length === 0) {
      return this.discoveryService.getFriendRecommendations(
        req.user.userId,
        parseInt(limit, 10) || 20,
        cursor,
      );
    }
    // 1 character -> ignore (return empty suggestions without hitting database search engine)
    if (searchQuery.length === 1) {
      return { items: [], nextCursor: undefined };
    }
    return this.searchService.searchUsers(req.user.userId, {
      q: searchQuery,
      query: searchQuery,
      limit: parseInt(limit, 10),
      cursor,
      filter,
    });
  }

  @Get('recommendations')
  async getRecommendations(
    @Req() req: RequestWithUser,
    @Query('limit') limit = '20',
    @Query('cursor') cursor?: string,
  ) {
    return this.discoveryService.getFriendRecommendations(
      req.user.userId,
      parseInt(limit, 10),
      cursor,
    );
  }

  @Get('circles')
  async getExplorerCircles(@Req() req: RequestWithUser) {
    return this.discoveryService.getExplorerCirclesGraph(req.user.userId);
  }

  @Get('history')
  async getSearchHistory(
    @Req() req: RequestWithUser,
    @Query('limit') limit = '10',
  ) {
    return this.searchService.getSearchHistory(
      req.user.userId,
      parseInt(limit, 10),
    );
  }
}
