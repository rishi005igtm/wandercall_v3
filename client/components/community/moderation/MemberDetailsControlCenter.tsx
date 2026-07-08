'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  VolumeX,
  Volume2,
  UserX,
  Ban,
  Unlock,
  AlertTriangle,
  History,
  Award,
  Clock,
  ChevronRight,
  X,
  CheckCircle2,
  Sparkles,
  Info,
  UserCheck,
} from 'lucide-react';
import {
  useMemberHistory,
  useWarnMember,
  useMuteMember,
  useUnmuteMember,
  useKickMember,
  useBanMember,
  useUnbanMember,
  useUpdateRole,
  useTransferOwnership,
  useAllRoles,
} from '../../../hooks/useCommunity';

interface MemberDetailsControlCenterProps {
  communityId: string;
  member: {
    id: string;
    userId: string;
    nickname?: string | null;
    isOwner?: boolean;
    roleId?: string | null;
    status?: string;
    isMuted?: boolean;
    mutedUntil?: string | null;
    joinedAt?: string;
    user?: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string;
    };
  };
  currentUserRole?: {
    priority: number;
    permissions: string[];
    isOwner: boolean;
  };
  onClose: () => void;
  onUpdateMember?: (updated: any) => void;
}

export const MemberDetailsControlCenter: React.FC<MemberDetailsControlCenterProps> = ({
  communityId,
  member: initialMember,
  currentUserRole = { priority: 100, permissions: [], isOwner: false },
  onClose,
  onUpdateMember,
}) => {
  const [currentMember, setCurrentMember] = useState(initialMember);
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'history'>('overview');
  const [actionReason, setActionReason] = useState('');
  const [muteDuration, setMuteDuration] = useState<number>(15); // minutes
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialMember.roleId || '');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    setCurrentMember(initialMember);
    if (initialMember.roleId !== undefined) {
      setSelectedRoleId(initialMember.roleId || '');
    }
  }, [initialMember]);

  // Queries & Mutations
  const { data: historyData, isLoading: historyLoading } = useMemberHistory(communityId, currentMember.userId);
  const { data: rolesData } = useAllRoles();

  const warnMutation = useWarnMember();
  const muteMutation = useMuteMember();
  const unmuteMutation = useUnmuteMember();
  const kickMutation = useKickMember();
  const banMutation = useBanMember();
  const unbanMutation = useUnbanMember();
  const updateRoleMutation = useUpdateRole();
  const transferOwnershipMutation = useTransferOwnership();

  const activeRoleId = selectedRoleId || currentMember.roleId;
  const targetRole = rolesData?.find((r: any) => r.id === activeRoleId || r.name === activeRoleId || (activeRoleId === 'ADMIN' && r.name === 'ADMIN') || (activeRoleId === 'MEMBER' && r.name === 'MEMBER'));
  const targetPriority = currentMember.isOwner ? 1 : targetRole?.priority ?? 100;

  const displayUsername = (currentMember as any).username || currentMember.user?.username || (currentMember as any).displayName?.toLowerCase().replace(/\s+/g, '') || currentMember.user?.displayName?.toLowerCase().replace(/\s+/g, '') || currentMember.userId.slice(0, 8);

  const isAdmin = !currentUserRole.isOwner && (currentUserRole.priority <= 10 || (currentUserRole as any).name === 'ADMIN' || currentUserRole.permissions?.includes('admin.access'));
  const canModerate = currentUserRole.isOwner || (isAdmin && !currentMember.isOwner && targetPriority > 10);

  const canWarn = canModerate;
  const canMute = canModerate;
  const canKick = canModerate;
  const canBan = canModerate;
  const canAssignRole = canModerate;

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleWarn = async () => {
    try {
      await warnMutation.mutateAsync({ communityId, targetUserId: currentMember.userId, reason: actionReason || 'Community guideline warning' });
      showNotification('success', `Warning issued to @${displayUsername}`);
      setActionReason('');
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Failed to issue warning');
    }
  };

  const handleMute = async () => {
    try {
      await muteMutation.mutateAsync({ communityId, targetUserId: currentMember.userId, durationMinutes: muteDuration });
      const updated = { ...currentMember, isMuted: true, mutedUntil: new Date(Date.now() + muteDuration * 60000).toISOString() };
      setCurrentMember(updated);
      onUpdateMember?.(updated);
      showNotification('success', `Member muted for ${muteDuration} minutes`);
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Failed to mute member');
    }
  };

  const handleUnmute = async () => {
    try {
      await unmuteMutation.mutateAsync({ communityId, targetUserId: currentMember.userId, reason: actionReason });
      const updated = { ...currentMember, isMuted: false, mutedUntil: null };
      setCurrentMember(updated);
      onUpdateMember?.(updated);
      showNotification('success', 'Mute lifted');
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Failed to unmute member');
    }
  };

  const handleKick = async () => {
    try {
      await kickMutation.mutateAsync({ communityId, targetUserId: currentMember.userId });
      showNotification('success', 'Member kicked from community');
      onClose();
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Failed to kick member');
    }
  };

  const handleBan = async (permanent = true) => {
    try {
      await banMutation.mutateAsync({
        communityId,
        targetUserId: currentMember.userId,
        reason: actionReason || 'Violation of community rules',
        permanent,
      });
      const updated = { ...currentMember, status: 'BANNED' };
      setCurrentMember(updated);
      onUpdateMember?.(updated);
      showNotification('success', `Member ${permanent ? 'permanently' : 'temporarily'} banned`);
      onClose();
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Failed to ban member');
    }
  };

  const handleUnban = async () => {
    try {
      await unbanMutation.mutateAsync({ communityId, targetUserId: currentMember.userId, reason: actionReason });
      const updated = { ...currentMember, status: 'ACTIVE' };
      setCurrentMember(updated);
      onUpdateMember?.(updated);
      showNotification('success', 'Ban lifted successfully');
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Failed to unban member');
    }
  };

  const handleRoleChange = async (roleId: string) => {
    try {
      await updateRoleMutation.mutateAsync({ communityId, targetUserId: currentMember.userId, roleId });
      setSelectedRoleId(roleId);
      const updated = { ...currentMember, roleId };
      setCurrentMember(updated);
      onUpdateMember?.(updated);
      showNotification('success', 'Member role updated');
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Failed to update role');
    }
  };

  const handleTransferOwnership = async () => {
    if (!window.confirm('Are you absolutely sure you want to transfer ownership of this community to this explorer? This action cannot be undone.')) return;
    try {
      await transferOwnershipMutation.mutateAsync({ communityId, newOwnerId: currentMember.userId });
      showNotification('success', 'Ownership transferred successfully');
      onClose();
    } catch (err: any) {
      showNotification('error', err?.response?.data?.message || 'Failed to transfer ownership');
    }
  };

  // Trust score formula (100 base - 15 * warnings - 25 * mutes)
  const warningsCount = historyData?.warningsCount || 0;
  const mutesCount = historyData?.mutesCount || 0;
  const trustScore = Math.max(0, Math.min(100, 100 - warningsCount * 15 - mutesCount * 25));

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400 text-emerald-400 border-emerald-500/30';
    if (score >= 50) return 'from-amber-500 to-yellow-400 text-amber-400 border-amber-500/30';
    return 'from-rose-600 to-red-400 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header Glow */}
        <div className="absolute top-0 left-1/4 w-1/2 h-24 bg-purple-600/20 blur-3xl pointer-events-none" />

        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Member Control Center
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                  OS Security v2.4
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Manage rank permissions, moderation status, and infractions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Pill */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mx-6 mt-4 p-3 rounded-2xl border flex items-center gap-3 text-sm font-medium ${
                notification.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Member Hero Banner */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between gap-4 bg-zinc-900/30 border-b border-zinc-800/60">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold text-white tracking-tight font-mono">
                @{displayUsername}
              </span>
              <span
                className="px-2.5 py-0.5 text-xs font-semibold rounded-lg border"
                style={{
                  backgroundColor: targetRole?.displayColor ? `${targetRole.displayColor}15` : '#A855F715',
                  borderColor: targetRole?.displayColor ? `${targetRole.displayColor}40` : '#A855F740',
                  color: targetRole?.displayColor || '#D8B4FE',
                }}
              >
                {currentMember.isOwner ? 'Owner' : targetRole?.displayName || targetRole?.name || 'Member'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Joined{' '}
                {currentMember.joinedAt ? new Date(currentMember.joinedAt).toLocaleDateString() : 'Recently'}
              </span>
              {currentMember.isMuted && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium flex items-center gap-1">
                  <VolumeX className="w-3 h-3" /> Muted
                </span>
              )}
              {currentMember.status === 'BANNED' && (
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium flex items-center gap-1">
                  <Ban className="w-3 h-3" /> Banned
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-zinc-800 px-6 gap-6 bg-zinc-900/20">
          {[
            { id: 'overview', label: 'Overview & Role', icon: Shield },
            { id: 'actions', label: 'Moderation Actions', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Role Assignment */}
              <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-400" /> Rank & Role Hierarchy
                    </h5>
                    <p className="text-xs text-zinc-400">
                      Roles define what this member can execute across chat, posts, and moderation.
                    </p>
                  </div>
                  {!canAssignRole && (
                    <span className="text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                      Hierarchy Locked
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {(() => {
                    const presetRoleNames = ['ADMIN', 'MEMBER', 'GUEST'];
                    if (currentUserRole.isOwner && !currentMember.isOwner) {
                      presetRoleNames.unshift('OWNER');
                    }
                    const displayRoles = rolesData?.filter((r: any) =>
                      presetRoleNames.includes(r.name) ||
                      ['Owner', 'Admin', 'Member', 'Guest'].includes(r.displayName)
                    ) || [];

                    const fallbackRoles = [
                      ...(currentUserRole.isOwner && !currentMember.isOwner ? [{ id: 'OWNER', name: 'OWNER', displayName: 'Owner', displayColor: '#A855F7', priority: 1 }] : []),
                      { id: 'ADMIN', name: 'ADMIN', displayName: 'Admin', displayColor: '#EAB308', priority: 10 },
                      { id: 'MEMBER', name: 'MEMBER', displayName: 'Member', displayColor: '#3B82F6', priority: 100 },
                      { id: 'GUEST', name: 'GUEST', displayName: 'Guest', displayColor: '#9CA3AF', priority: 200 },
                    ];

                    const rolesToShow = displayRoles.length > 0 ? displayRoles : fallbackRoles;

                    return rolesToShow.map((r: any) => {
                      const isCurrent = (activeRoleId === r.id) || (activeRoleId === r.name) || (!activeRoleId && r.name === 'MEMBER') || (currentMember.isOwner && r.name === 'OWNER');
                      const isRankAboveActor = !currentUserRole.isOwner && r.priority <= currentUserRole.priority;

                      return (
                        <button
                          key={r.id || r.name}
                          disabled={(!canAssignRole || isRankAboveActor || currentMember.isOwner) && r.name !== 'OWNER'}
                          onClick={() => {
                            if (r.name === 'OWNER' || r.displayName === 'Owner') {
                              handleTransferOwnership();
                            } else {
                              handleRoleChange(r.id || r.name);
                            }
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                            isCurrent
                              ? 'bg-purple-500/15 border-purple-500/50 text-white ring-1 ring-purple-500/30'
                              : isRankAboveActor || (currentMember.isOwner && r.name !== 'OWNER')
                              ? 'bg-zinc-900/30 border-zinc-800/50 text-zinc-600 cursor-not-allowed'
                              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: r.displayColor || '#A855F7' }} />
                            <div>
                              <div className="text-xs font-bold text-white">{r.displayName || r.name}</div>
                            </div>
                          </div>
                          {isCurrent && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {!canModerate && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-sm text-rose-300 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                  <span>You cannot moderate members with equal or higher rank than yourself.</span>
                </div>
              )}

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Warn Box */}
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> Issue Warning
                    </h6>
                    <p className="text-xs text-zinc-400 mt-1">Logs a permanent warning entry without restricting access.</p>
                  </div>
                  <button
                    disabled={!canWarn}
                    onClick={handleWarn}
                    className="w-full py-2 bg-amber-500/15 hover:bg-amber-500/25 disabled:opacity-40 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    Send Warning Notice
                  </button>
                </div>

                {/* Mute Box */}
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      {currentMember.isMuted ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-orange-400" />}
                      {currentMember.isMuted ? 'Lift Mute' : 'Mute Member'}
                    </h6>
                    <p className="text-xs text-zinc-400 mt-1">Restricts chat messaging and story creation for the duration.</p>
                  </div>

                  {currentMember.isMuted ? (
                    <button
                      disabled={!canMute}
                      onClick={handleUnmute}
                      className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
                    >
                      Unmute Immediately
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        {[15, 60, 1440, 10080].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setMuteDuration(mins)}
                            className={`flex-1 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              muteDuration === mins
                                ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                                : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
                            }`}
                          >
                            {mins === 15 ? '15m' : mins === 60 ? '1h' : mins === 1440 ? '24h' : '7d'}
                          </button>
                        ))}
                      </div>
                      <button
                        disabled={!canMute}
                        onClick={handleMute}
                        className="w-full py-2 bg-orange-500/15 hover:bg-orange-500/25 disabled:opacity-40 text-orange-300 border border-orange-500/30 rounded-xl text-xs font-bold transition-all"
                      >
                        Mute for {muteDuration === 15 ? '15 minutes' : muteDuration === 60 ? '1 hour' : muteDuration === 1440 ? '24 hours' : '7 days'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Kick Box */}
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserX className="w-4 h-4 text-rose-400" /> Kick from Community
                    </h6>
                    <p className="text-xs text-zinc-400 mt-1">Removes member instantly. They can re-join if the community is public.</p>
                  </div>
                  <button
                    disabled={!canKick}
                    onClick={handleKick}
                    className="w-full py-2 bg-rose-500/15 hover:bg-rose-500/25 disabled:opacity-40 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    Kick Member
                  </button>
                </div>

                {/* Ban Box */}
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <h6 className="text-sm font-bold text-white flex items-center gap-2">
                      {currentMember.status === 'BANNED' ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Ban className="w-4 h-4 text-red-500" />}
                      {currentMember.status === 'BANNED' ? 'Revoke Ban' : 'Permanent Ban'}
                    </h6>
                    <p className="text-xs text-zinc-400 mt-1">Prevents member from ever re-entering this community.</p>
                  </div>
                  {currentMember.status === 'BANNED' ? (
                    <button
                      disabled={!canBan}
                      onClick={handleUnban}
                      className="w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all"
                    >
                      Revoke Ban
                    </button>
                  ) : (
                    <button
                      disabled={!canBan}
                      onClick={() => handleBan(true)}
                      className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-40 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition-all"
                    >
                      Ban Permanently
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12 text-zinc-500 text-sm">Loading audit timeline...</div>
              ) : historyData?.auditLogs && historyData.auditLogs.length > 0 ? (
                <div className="relative pl-6 border-l border-zinc-800 space-y-6 py-2">
                  {historyData.auditLogs.map((log: any) => (
                    <div key={log.id} className="relative group">
                      <span className="absolute -left-[29px] top-1.5 w-3.5 h-3.5 rounded-full bg-zinc-800 border-2 border-purple-500/80" />
                      <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-2xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-purple-400">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-zinc-500">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-zinc-200 font-medium">{log.reason || 'No specific reason provided'}</p>
                        <div className="text-xs text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800/80">
                          <span>By Moderator: {log.actor?.displayName || log.actor?.username || log.actorId.slice(0, 8)}</span>
                          {log.oldRole && log.newRole && (
                            <span className="text-zinc-400 font-mono">
                              {log.oldRole} → {log.newRole}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500 text-sm">
                  <History className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                  No infractions or role changes recorded in the immutable ledger.
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
