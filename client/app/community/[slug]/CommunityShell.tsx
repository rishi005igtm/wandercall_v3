'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
import CommunityDashboard from './_page_monolith';

export default function CommunityShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();
  
  const tabMap: Record<string, string> = {
    'chat': 'Chat',
    'stories': 'Stories',
    'experiences': 'Experiences',
    'members': 'Members',
    'gallery': 'Gallery',
    'leaderboard': 'Leaderboard'
  };
  
  const activeTab = segment ? tabMap[segment] || 'Chat' : 'Chat';

  return (
    <>
      <CommunityDashboard initialTab={activeTab}>
        {children}
      </CommunityDashboard>
    </>
  );
}
