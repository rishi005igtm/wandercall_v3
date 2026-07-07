'use client';

import React, { useState } from 'react';
import { Users, Sparkles, Check, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAcceptInvite, useDeclineInvite, useCommunity, useJoinCommunity, useMyCommunities } from '../../../hooks/useCommunity';
import { useRouter } from 'next/navigation';

export interface CommunityInviteMetadata {
  inviteId?: string;
  communityId?: string;
  communityName?: string;
  communityAvatar?: string;
  communityCover?: string;
  memberCount?: number;
  slug?: string;
  description?: string;
}

export const CommunityInviteRenderer: React.FC<{
  message: any;
  currentUserId?: string | null;
}> = ({ message, currentUserId }) => {
  const router = useRouter();
  let metadata: CommunityInviteMetadata = {};
  try {
    const raw = message?.metadata;
    if (typeof raw === 'string') {
      metadata = JSON.parse(raw);
    } else if (raw && typeof raw === 'object') {
      metadata = raw;
    }
    // Handle potential double stringification
    if (typeof metadata === 'string') {
      metadata = JSON.parse(metadata);
    }
  } catch (e) {
    console.error("Failed to parse metadata", e);
  }
  
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'DECLINED'>('PENDING');

  const { data: community } = useCommunity(metadata.slug || metadata.communityId || '');
  const { data: myCommunities } = useMyCommunities();
  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptInvite();
  const { mutate: declineInvite, isPending: isDeclining } = useDeclineInvite();
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();

  const displayTitle = community?.name || metadata.communityName || 'Wander Community';
  const displayDesc = community?.description || metadata.description || 'You have been invited to join this community. Discover stories, adventures, and connect with fellow nomads!';
  const displayAvatar = community?.avatar || metadata.communityAvatar;
  const displayCover = community?.cover || metadata.communityCover;
  const displayMembers = community?.currentMemberCount ?? metadata.memberCount;
  const targetSlugOrId = community?.id || metadata.communityId || community?.slug || metadata.slug;

  const navigateToCommunity = () => {
    if (targetSlugOrId) {
      router.push(`/community/${targetSlugOrId}`);
    }
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    const targetId = metadata.communityId || community?.id;

    if (metadata.inviteId) {
      acceptInvite(metadata.inviteId, {
        onSuccess: () => {
          setStatus('ACCEPTED');
          navigateToCommunity();
        },
        onError: () => {
          if (targetId && !isAlreadyMember) {
            joinCommunity(targetId, {
              onSuccess: () => {
                setStatus('ACCEPTED');
                navigateToCommunity();
              },
              onError: () => navigateToCommunity()
            });
          } else {
            navigateToCommunity();
          }
        }
      });
    } else if (targetId) {
      joinCommunity(targetId, {
        onSuccess: () => {
          setStatus('ACCEPTED');
          navigateToCommunity();
        },
        onError: () => {
          setStatus('ACCEPTED');
          navigateToCommunity();
        }
      });
    } else {
      navigateToCommunity();
    }
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!metadata.inviteId) return;
    declineInvite(metadata.inviteId, {
      onSuccess: () => setStatus('DECLINED'),
      onError: () => setStatus('DECLINED'),
    });
  };

  const isSender = message.senderId === currentUserId;
  const isAlreadyMember = status === 'ACCEPTED' || myCommunities?.some((c: any) => c.id === targetSlugOrId || c.id === metadata.communityId || c.slug === targetSlugOrId);
  const isLoading = isAccepting || isJoining;

  return (
    <div 
      onClick={navigateToCommunity}
      className="my-2 w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-md shadow-xl hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group text-left"
    >
      {/* Cover Banner */}
      <div className="relative h-28 w-full bg-gradient-to-r from-cyan-600 to-indigo-600 overflow-hidden">
        {displayCover ? (
          <img 
            src={displayCover} 
            alt={displayTitle} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white/40 animate-pulse" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Avatar badge */}
        <div className="absolute -bottom-4 left-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl border-2 border-slate-900 bg-slate-800 overflow-hidden shadow-lg flex items-center justify-center font-bold text-xl text-cyan-400">
            {displayAvatar ? (
              <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              displayTitle?.[0]?.toUpperCase() || 'C'
            )}
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-3 right-3 bg-cyan-500/20 border border-cyan-500/30 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-semibold text-cyan-300 shadow-sm">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Community Invite</span>
        </div>
      </div>

      {/* Content */}
      <div className="pt-6 pb-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-bold text-base text-white truncate group-hover:text-cyan-400 transition-colors">
            {displayTitle}
          </h4>
          {displayMembers !== undefined && (
            <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md shrink-0">
              <Users className="w-3 h-3 text-cyan-400" />
              <span>{displayMembers}</span>
            </div>
          )}
        </div>

        <p className="mt-1.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>

        {/* Action area */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          {isSender ? (
            <div className="w-full py-1.5 px-3 rounded-xl bg-slate-800/50 text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 border border-white/5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Invite sent</span>
            </div>
          ) : isAlreadyMember ? (
            <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Joined Community • View</span>
            </div>
          ) : status === 'DECLINED' ? (
            <div className="w-full py-2 px-3 rounded-xl bg-slate-800/40 text-slate-500 text-xs font-medium flex items-center justify-center">
              <span>Invite Declined</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={handleAccept}
                disabled={isLoading || isDeclining}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Joining...' : 'Join Now'}</span>
              </button>
              {metadata.inviteId && (
                <button
                  onClick={handleDecline}
                  disabled={isLoading || isDeclining}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
