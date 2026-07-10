import { Injectable } from '@nestjs/common';
import { CampfireEntity } from '../entities/campfire.entity';

@Injectable()
export class CampfirePolicyService {
  canCreateCampfire(userId: string, communityId?: string): boolean {
    // In Phase 2, this will check CommunityMembership, Roles, and Permissions
    return true; 
  }

  canUpdateCampfire(userId: string, campfire: CampfireEntity): boolean {
    return campfire.hostId === userId;
  }

  canDeleteCampfire(userId: string, campfire: CampfireEntity): boolean {
    return campfire.hostId === userId;
  }

  canStartCampfire(userId: string, campfire: CampfireEntity): boolean {
    return campfire.hostId === userId;
  }

  canStopCampfire(userId: string, campfire: CampfireEntity): boolean {
    return campfire.hostId === userId;
  }
}
