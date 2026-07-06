'use client';

import React, { useState } from 'react';
import { X, Search, UserPlus, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/store/store';
import { setInviteModalOpen } from '@/lib/store/slices/communityMembershipSlice';
import { useFriends } from '@/hooks/api/useFriends';
import { useInviteMember } from '@/hooks/useCommunity';

interface InviteModalProps {
  communityId: string;
}

export default function InviteModal({ communityId }: InviteModalProps) {
  const dispatch = useAppDispatch();
  const { isInviteModalOpen } = useAppSelector((state) => state.communityMembership);
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());

  const { data: friendsData, isLoading } = useFriends(20, searchQuery);
  const inviteMemberMutation = useInviteMember();

  if (!isInviteModalOpen) return null;

  const friends = friendsData?.pages.flatMap((page) => page.items) || [];

  const handleInvite = async (userId: string) => {
    if (invitedUsers.has(userId)) return;

    try {
      await inviteMemberMutation.mutateAsync({ communityId, targetUserId: userId });
      setInvitedUsers((prev) => new Set(prev).add(userId));
    } catch (error) {
      console.error('Failed to invite user', error);
      // Optional: Add toast notification here
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => dispatch(setInviteModalOpen(false))} />
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6">
        <button
          onClick={() => dispatch(setInviteModalOpen(false))}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Invite Friends</h3>
        <p className="text-zinc-400 text-sm mb-6">Invite your mutual friends to join this community.</p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <p className="text-center text-zinc-500 text-sm py-4">Loading friends...</p>
          ) : friends.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm py-4">No friends found.</p>
          ) : (
            friends.map((friend) => {
              const isInvited = invitedUsers.has(friend.userId);
              return (
                <div key={friend.userId} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                      alt={friend.displayName}
                      className="w-10 h-10 rounded-full border border-zinc-800 object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-zinc-200">{friend.displayName}</h4>
                      <p className="text-xs text-zinc-500">@{friend.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInvite(friend.userId)}
                    disabled={isInvited || inviteMemberMutation.isPending}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isInvited
                        ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                        : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                    }`}
                  >
                    {isInvited ? (
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Invited</span>
                    ) : (
                      <span className="flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Invite</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
