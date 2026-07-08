import { redirect } from 'next/navigation';

import { use } from 'react';

export default function CommunityRoot({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  redirect(`/community/${resolvedParams.slug}/chat`);
}
