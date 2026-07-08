'use client';

import React, { useState } from 'react';
import { useCommunityAuditLogs } from '../../../hooks/useCommunity';
import { Shield, Filter, Search, Clock, User, AlertTriangle, ArrowRight } from 'lucide-react';

interface AuditLogsTableProps {
  communityId: string;
}

const ACTION_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  MEMBER_WARN: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  MEMBER_MUTE: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  MEMBER_UNMUTE: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  MEMBER_KICK: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  MEMBER_BAN: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  MEMBER_UNBAN: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  ROLE_ASSIGN: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  OWNERSHIP_TRANSFER: { bg: 'bg-amber-400/20', text: 'text-amber-300', border: 'border-amber-400/40' },
  STORY_PIN: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  STORY_UNPIN: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
  STORY_DELETE: { bg: 'bg-rose-600/10', text: 'text-rose-300', border: 'border-rose-600/20' },
};

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ communityId }) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data, isLoading, error } = useCommunityAuditLogs(communityId, {
    action: selectedAction || undefined,
    limit: 50,
  });

  const logs = data?.items || [];
  const filteredLogs = logs.filter((log: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const actorName = (log.actor?.displayName || log.actor?.username || log.actorId || '').toLowerCase();
    const reason = (log.reason || '').toLowerCase();
    const action = log.action.toLowerCase();
    return actorName.includes(q) || reason.includes(q) || action.includes(q);
  });

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Immutable Audit Ledger
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cryptographically tracked records of all moderation and administrative actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Action Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="pl-9 pr-8 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-300 font-medium focus:outline-none focus:border-purple-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="">All Actions</option>
              <option value="MEMBER_WARN">Warnings</option>
              <option value="MEMBER_MUTE">Mutes</option>
              <option value="MEMBER_KICK">Kicks</option>
              <option value="MEMBER_BAN">Bans</option>
              <option value="ROLE_ASSIGN">Role Changes</option>
              <option value="STORY_PIN">Story Pins</option>
              <option value="STORY_DELETE">Story Purges</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter logs by actor or reason..."
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors w-64"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-zinc-500 font-medium">Fetching immutable audit stream...</div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-rose-400 font-medium">Failed to load audit ledger records.</div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-500">
          <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          No audit logs found matching your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target / Resource</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Role Transition</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {filteredLogs.map((log: any) => {
                const badge = ACTION_COLOR_MAP[log.action] || {
                  bg: 'bg-zinc-800',
                  text: 'text-zinc-300',
                  border: 'border-zinc-700',
                };

                return (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Action Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-xl font-bold border text-[11px] ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-white flex items-center gap-2">
                      <img
                        src={log.actor?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${log.actorId}`}
                        alt={log.actor?.displayName || 'Mod'}
                        className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                      />
                      <span>{log.actor?.displayName || log.actor?.username || log.actorId?.slice(0, 8)}</span>
                    </td>

                    {/* Target */}
                    <td className="py-3 px-4 whitespace-nowrap text-zinc-300">
                      {log.targetUserId ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Explorer #{log.targetUserId.slice(0, 8)}</span>
                        </div>
                      ) : log.metadata?.storyId ? (
                        <span className="text-purple-400 font-mono">Story #{log.metadata.storyId.slice(0, 8)}</span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 max-w-xs truncate text-zinc-300" title={log.reason}>
                      {log.reason || <span className="text-zinc-600 italic">No reason specified</span>}
                    </td>

                    {/* Role Transition */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-zinc-400">
                      {log.oldRole && log.newRole ? (
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-500">{log.oldRole}</span>
                          <ArrowRight className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-300 font-bold">{log.newRole}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-right text-zinc-500 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
