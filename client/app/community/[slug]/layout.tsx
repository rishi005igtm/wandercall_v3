import CommunityShell from './CommunityShell';
import { ReactNode } from 'react';

export default function CommunityLayout({ children, params }: { children: ReactNode, params: Promise<{ slug: string }> }) {
  return <CommunityShell>{children}</CommunityShell>;
}
