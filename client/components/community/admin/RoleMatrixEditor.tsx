'use client';

import React, { useState } from 'react';
import { useAllRoles, useCreateRole, useUpdateCustomRole, useDeleteRole } from '../../../hooks/useCommunity';
import { Shield, Plus, Trash2, Edit2, Check, X, Lock, Sparkles } from 'lucide-react';

export const PERMISSION_LIST = [
  { id: 'post.create', label: 'Create Posts & Share Stories', category: 'Content' },
  { id: 'chat.send', label: 'Send Messages in Lobby', category: 'Content' },
  { id: 'story.create', label: 'Publish Stories', category: 'Content' },
  { id: 'story.pin', label: 'Pin & Feature Stories', category: 'Moderation' },
  { id: 'story.delete', label: 'Delete Member Stories', category: 'Moderation' },
  { id: 'member.mute', label: 'Warn & Mute Members', category: 'Moderation' },
  { id: 'member.kick', label: 'Kick Members Out', category: 'Moderation' },
  { id: 'member.ban', label: 'Ban & Unban Members', category: 'Moderation' },
  { id: 'role.assign', label: 'Assign Roles (Within Hierarchy)', category: 'Administration' },
  { id: 'role.manage', label: 'Create & Manage Roles', category: 'Administration' },
  { id: 'admin.access', label: 'Access Admin Control Center', category: 'Administration' },
];

export const RoleMatrixEditor: React.FC = () => {
  const { data: roles, isLoading } = useAllRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateCustomRole();
  const deleteMutation = useDeleteRole();

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleColor, setNewRoleColor] = useState<string>('#A855F7');
  const [newRolePriority, setNewRolePriority] = useState<number>(80);
  const [newRolePerms, setNewRolePerms] = useState<string[]>(['post.create', 'chat.send', 'story.create']);

  const activeRole = roles?.find((r: any) => r.id === selectedRoleId) || roles?.[0];

  const handleTogglePermission = async (permId: string) => {
    if (!activeRole || !activeRole.editable || activeRole.protected) return;

    const currentPerms = Array.isArray(activeRole.permissions) ? activeRole.permissions : [];
    const updatedPerms = currentPerms.includes(permId)
      ? currentPerms.filter((p: string) => p !== permId)
      : [...currentPerms, permId];

    try {
      await updateMutation.mutateAsync({
        roleId: activeRole.id,
        data: { permissions: updatedPerms },
      });
    } catch (err) {
      console.error('Failed to update permission:', err);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const created = await createMutation.mutateAsync({
        name: newRoleName.trim(),
        displayName: newRoleName.trim(),
        displayColor: newRoleColor,
        priority: Number(newRolePriority),
        permissions: newRolePerms,
      });
      setSelectedRoleId(created.id);
      setIsCreating(false);
      setNewRoleName('');
    } catch (err) {
      console.error('Failed to create custom role:', err);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? Members holding this role will revert to Member.')) return;
    try {
      await deleteMutation.mutateAsync(roleId);
      setSelectedRoleId('');
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-zinc-500">Loading hierarchy roles and permissions...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Role Selector & Creator Column */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Community Roles
              </h4>
              <p className="text-[11px] text-zinc-400">Order by priority rank (Lower # = Higher Authority)</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-md flex items-center gap-1 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {/* Role List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {roles?.map((r: any) => {
              const isSelected = activeRole?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRoleId(r.id);
                    setIsCreating(false);
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/15 border-purple-500/60 text-white shadow-lg'
                      : 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-2 ring-white/10 shrink-0"
                      style={{ backgroundColor: r.displayColor || '#A855F7' }}
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {r.displayName || r.name}
                        {r.protected && <span title="Protected System Role"><Lock className="w-3 h-3 text-zinc-500" /></span>}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">Priority Rank #{r.priority}</div>
                    </div>
                  </div>

                  {!r.protected && !r.systemRole && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(r.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Role Modal/Card Inline */}
        {isCreating && (
          <form onSubmit={handleCreateRole} className="bg-zinc-950 border border-purple-500/40 p-4 rounded-2xl space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Create Custom Role</span>
              <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="Role Name (e.g. VIP Member)"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newRoleColor}
                onChange={(e) => setNewRoleColor(e.target.value)}
                className="w-8 h-8 rounded-lg border border-zinc-700 cursor-pointer bg-transparent shrink-0"
              />
              <input
                type="number"
                min={2}
                max={999}
                value={newRolePriority}
                onChange={(e) => setNewRolePriority(Number(e.target.value))}
                placeholder="Priority Rank (2-999)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow transition-all"
            >
              {createMutation.isPending ? 'Creating...' : 'Deploy Role'}
            </button>
          </form>
        )}
      </div>

      {/* Permission Matrix Editor */}
      <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 space-y-6">
        {activeRole ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: activeRole.displayColor }} />
                  {activeRole.displayName || activeRole.name} Permissions
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {activeRole.protected
                    ? 'This is a system-protected root role. Core capabilities cannot be stripped.'
                    : 'Configure granular capability checkboxes for members holding this rank.'}
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs font-mono text-purple-300">
                Rank #{activeRole.priority}
              </div>
            </div>

            {/* Matrix Categories */}
            {['Content', 'Moderation', 'Administration'].map((category) => (
              <div key={category} className="space-y-3">
                <h5 className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider">{category} Capabilities</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PERMISSION_LIST.filter((p) => p.category === category).map((perm) => {
                    const hasPerm = Array.isArray(activeRole.permissions) && activeRole.permissions.includes(perm.id);
                    const isLocked = activeRole.protected || !activeRole.editable;

                    return (
                      <div
                        key={perm.id}
                        onClick={() => !isLocked && handleTogglePermission(perm.id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isLocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer hover:border-zinc-700'
                        } ${
                          hasPerm
                            ? 'bg-purple-500/10 border-purple-500/40 text-white'
                            : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-400'
                        }`}
                      >
                        <span className="text-xs font-medium">{perm.label}</span>
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                            hasPerm ? 'bg-purple-600 text-white' : 'bg-zinc-800 border border-zinc-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-sm text-zinc-500">Select or create a role on the left to configure permissions.</div>
        )}
      </div>
    </div>
  );
};
