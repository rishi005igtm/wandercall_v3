'use client';

import React, { useState } from 'react';

interface CompanionAvatarProps {
  avatar?: string | null;
  name?: string | null;
  className?: string;
}

const HASH_COLORS = [
  'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30',
  'bg-brand-purple/20 text-brand-purple border border-brand-purple/30',
  'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30',
  'bg-brand-amber/20 text-brand-amber border border-brand-amber/30',
  'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30',
];

function getHashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return HASH_COLORS[Math.abs(hash) % HASH_COLORS.length];
}

export function CompanionAvatar({ avatar, name, className = 'h-8 w-8 text-xs' }: CompanionAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const isUrl =
    avatar &&
    (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/'));

  const initials = name && name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : 'W';

  if (isUrl && !hasError) {
    return (
      <img
        src={avatar || undefined}
        alt={name || 'Explorer'}
        onError={() => setHasError(true)}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full flex items-center justify-center font-bold shrink-0 select-none ${getHashColor(name || 'Wanderer')}`}
    >
      {initials}
    </div>
  );
}
