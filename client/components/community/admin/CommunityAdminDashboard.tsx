'use client';

import React from 'react';

interface CommunityAdminDashboardProps {
  communityId: string;
  slug: string;
  currentUserMember: {
    id: string;
    userId: string;
    isOwner: boolean;
    roleId?: string | null;
    role?: {
      priority: number;
      permissions: string[];
    };
  };
}

export const CommunityAdminDashboard: React.FC<CommunityAdminDashboardProps> = () => {
  return null;
};
