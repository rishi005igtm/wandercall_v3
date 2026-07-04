import { Injectable } from '@nestjs/common';
import { FollowRepository } from '../repositories/follow.repository';
import { RelationshipResponseDto } from '../dto/relationship-response.dto';

@Injectable()
export class RelationshipService {
  constructor(private readonly followRepository: FollowRepository) {}

  async resolveRelationship(viewerId: string | null, targetUserId: string): Promise<RelationshipResponseDto> {
    const result = new RelationshipResponseDto();
    
    if (!viewerId) {
      result.viewerFollowsTarget = false;
      result.targetFollowsViewer = false;
      result.state = 'NOT_CONNECTED';
      result.canFollow = true;
      result.canFollowBack = false;
      result.canMessage = false;
      result.canInvite = false;
      result.isFriend = false;
      return result;
    }

    if (viewerId === targetUserId) {
      result.viewerFollowsTarget = false;
      result.targetFollowsViewer = false;
      result.state = 'SELF';
      result.canFollow = false;
      result.canFollowBack = false;
      result.canMessage = false;
      result.canInvite = false;
      result.isFriend = false;
      return result;
    }

    const [viewerFollowsTarget, targetFollowsViewer] = await Promise.all([
      this.followRepository.findOne(viewerId, targetUserId),
      this.followRepository.findOne(targetUserId, viewerId),
    ]);

    result.viewerFollowsTarget = !!viewerFollowsTarget;
    result.targetFollowsViewer = !!targetFollowsViewer;

    if (result.viewerFollowsTarget && result.targetFollowsViewer) {
      result.state = 'MUTUAL_FOLLOW';
      result.canFollow = false;
      result.canFollowBack = false;
      result.canMessage = true;
      result.canInvite = true;
      result.isFriend = true;
    } else if (result.viewerFollowsTarget && !result.targetFollowsViewer) {
      result.state = 'FOLLOWING';
      result.canFollow = false;
      result.canFollowBack = false;
      result.canMessage = false;
      result.canInvite = false;
      result.isFriend = false;
    } else if (!result.viewerFollowsTarget && result.targetFollowsViewer) {
      result.state = 'FOLLOWED_BY';
      result.canFollow = false;
      result.canFollowBack = true;
      result.canMessage = false;
      result.canInvite = false;
      result.isFriend = false;
    } else {
      result.state = 'NOT_CONNECTED';
      result.canFollow = true;
      result.canFollowBack = false;
      result.canMessage = false;
      result.canInvite = false;
      result.isFriend = false;
    }

    return result;
  }
}
