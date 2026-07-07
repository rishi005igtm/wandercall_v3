'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Users, Shield, ShieldAlert, Crown, MoreVertical, 
  UserMinus, Ban, VolumeX, Check, AlertTriangle, ChevronDown 
} from 'lucide-react';
import { 
  useSearchCommunityMembers, useKickMember, useBanMember, 
  useMuteMember, useUpdateRole, useTransferOwnership 
} from '../../hooks/useCommunity';
import { useDebounce } from '../../hooks/useDebounce';

interface CommunityMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  currentUserRole?: string;
  isOwner?: boolean;
}

export const CommunityMembersModal: React.FC<CommunityMembersModalProps> = ({
  isOpen,
  onClose,
  communityId,
  currentUserRole = 'MEMBER',
  isOwner = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'KICK' | 'BAN' | 'MUTE' | 'TRANSFER';
    userId: string;
    userName: string;
  } | null>(null);

  const { data, isLoading } = useSearchCommunityMembers(communityId, debouncedSearch, 30);
  const members = (data as any)?.members || (data as any)?.items || (Array.isArray(data) ? data : []);

  const { mutate: kickMember, isPending: isKicking } = useKickMember();
  const { mutate: banMember, isPending: isBanning } = useBanMember();
  const { mutate: muteMember, isPending: isMuting } = useMuteMember();
  const { mutate: transferOwnership, isPending: isTransferring } = useTransferOwnership();

  const canManage = isOwner || currentUserRole === 'ADMIN' || currentUserRole === 'MODERATOR' || currentUserRole === 'OWNER';

  const handleExecuteAction = () => {
    if (!confirmAction) return;
    const { type, userId } = confirmAction;

    if (type === 'KICK') {
      kickMember({ communityId, targetUserId: userId }, { onSuccess: () => setConfirmAction(null) });
    } else if (type === 'BAN') {
      banMember({ communityId, targetUserId: userId, reason: 'Violated community guidelines', permanent: true }, { onSuccess: () => setConfirmAction(null) });
    } else if (type === 'MUTE') {
      muteMember({ communityId, targetUserId: userId, durationMinutes: 60 }, { onSuccess: () => setConfirmAction(null) });
    } else if (type === 'TRANSFER') {
      transferOwnership({ communityId, newOwnerId: userId }, { onSuccess: () => setConfirmAction(null) });
    }
  };

  const getRoleBadge = (roleName?: string, isMemberOwner?: boolean) => {
    if (isMemberOwner || roleName === 'OWNER' || roleName === 'Owner') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 shadow-sm">
          <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>Owner</span>
        </span>
      );
    }
    if (roleName === 'ADMIN' || roleName === 'Admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
          <Shield className="w-3 h-3 text-cyan-400 fill-cyan-400" />
          <span>Admin</span>
        </span>
      );
    }
    if (roleName === 'MODERATOR' || roleName === 'Moderator') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 border border-blue-500/30 text-blue-300">
          <ShieldAlert className="w-3 h-3 text-blue-400" />
          <span>Moderator</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 border border-white/5 text-slate-400">
        <span>Member</span>
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Community Members</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 font-mono">
                    {members.length || 0}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Manage roles, permissions, and moderation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-white/5 bg-slate-950/40">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by username, name, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-medium">Loading members...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-300">No members found</p>
                <p className="text-xs text-slate-500 mt-1">Try searching with a different keyword</p>
              </div>
            ) : (
              members.map((member: any) => {
                const user = member.user || member;
                const userId = user.id || member.userId;
                const name = user.name || user.username || 'Wanderer';
                const avatar = user.avatar || user.profilePicture;
                const roleName = member.role?.displayName || member.roleName || member.role || 'Member';
                const isMemberOwner = member.isOwner || roleName === 'OWNER' || roleName === 'Owner';
                const isMe = userId === (member.currentUserId || '');

                return (
                  <div
                    key={member.id || userId}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-white/10 transition-all group relative"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-10 h-10 rounded-2xl bg-slate-800 overflow-hidden border border-white/10 shrink-0 flex items-center justify-center font-bold text-cyan-400">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          name[0]?.toUpperCase() || 'W'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {name}
                          </h4>
                          {isMe && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          @{user.username || name.toLowerCase().replace(/\s+/g, '')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getRoleBadge(roleName, isMemberOwner)}

                      {/* Management actions */}
                      {canManage && !isMemberOwner && !isMe && (
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === userId ? null : userId)}
                            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeDropdown === userId && (
                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setConfirmAction({ type: 'MUTE', userId, userName: name });
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                              >
                                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                                <span>Mute Member (1h)</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setConfirmAction({ type: 'KICK', userId, userName: name });
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                              >
                                <UserMinus className="w-3.5 h-3.5 text-orange-400" />
                                <span>Kick from Community</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveDropdown(null);
                                  setConfirmAction({ type: 'BAN', userId, userName: name });
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Ban Permanently</span>
                              </button>

                              {isOwner && (
                                <>
                                  <div className="my-1 border-t border-white/5" />
                                  <button
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      setConfirmAction({ type: 'TRANSFER', userId, userName: name });
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs text-purple-400 hover:bg-purple-500/10 flex items-center gap-2.5 transition-colors font-semibold"
                                  >
                                    <Crown className="w-3.5 h-3.5" />
                                    <span>Transfer Ownership</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {confirmAction && (
              <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Confirm {confirmAction.type === 'TRANSFER' ? 'Ownership Transfer' : confirmAction.type === 'BAN' ? 'Permanent Ban' : confirmAction.type === 'KICK' ? 'Kick Member' : 'Mute Member'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Are you sure you want to perform this action on <span className="text-white font-semibold">{confirmAction.userName}</span>?
                      {confirmAction.type === 'TRANSFER' && " This cannot be undone!"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteAction}
                      disabled={isKicking || isBanning || isMuting || isTransferring}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-semibold text-xs shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
                    >
                      {isKicking || isBanning || isMuting || isTransferring ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
