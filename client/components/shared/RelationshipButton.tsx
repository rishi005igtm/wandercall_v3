'use client';

import React from 'react';
import { useRelationship } from '@/hooks/api/useRelationship';
import { useFollowMutation, useUnfollowMutation } from '@/hooks/api/useUserMutations';
import { UserPlus, UserMinus, Users, Clock, ShieldAlert, Loader2 } from 'lucide-react';

interface RelationshipButtonProps {
  username: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const RelationshipButton: React.FC<RelationshipButtonProps> = ({
  username,
  className,
  variant = 'default',
  size = 'default',
}) => {
  const { data: relationship, isLoading, isError } = useRelationship(username);
  const followMutation = useFollowMutation();
  const unfollowMutation = useUnfollowMutation();

  if (isLoading) {
    return (
      <button className={`${className} opacity-50 cursor-not-allowed`} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </button>
    );
  }

  if (isError || !relationship) {
    return null; // Or some fallback
  }

  if (relationship.state === 'SELF') {
    return null;
  }

  const isPending = followMutation.isPending || unfollowMutation.isPending;

  const handleToggle = () => {
    if (relationship.state === 'FOLLOWING' || relationship.state === 'MUTUAL_FOLLOW') {
      unfollowMutation.mutate(username);
    } else if (relationship.state === 'NOT_CONNECTED' || relationship.state === 'FOLLOWED_BY') {
      followMutation.mutate(username);
    }
  };

  const getButtonConfig = () => {
    switch (relationship.state) {
      case 'MUTUAL_FOLLOW':
        return {
          label: 'Friends',
          icon: <Users className="h-4 w-4 mr-2" />,
          activeVariant: 'secondary' as const,
        };
      case 'FOLLOWING':
        return {
          label: 'Following',
          icon: <UserMinus className="h-4 w-4 mr-2" />,
          activeVariant: 'secondary' as const,
        };
      case 'FOLLOWED_BY':
        return {
          label: 'Follow Back',
          icon: <UserPlus className="h-4 w-4 mr-2" />,
          activeVariant: variant,
        };
      case 'NOT_CONNECTED':
        return {
          label: 'Follow',
          icon: <UserPlus className="h-4 w-4 mr-2" />,
          activeVariant: variant,
        };
      case 'PRIVATE_PENDING':
        return {
          label: 'Requested',
          icon: <Clock className="h-4 w-4 mr-2" />,
          activeVariant: 'secondary' as const,
        };
      case 'BLOCKED':
      case 'BLOCKED_BY':
      case 'RESTRICTED':
        return {
          label: 'Unavailable',
          icon: <ShieldAlert className="h-4 w-4 mr-2" />,
          activeVariant: 'destructive' as const,
        };
      default:
        return {
          label: 'Follow',
          icon: <UserPlus className="h-4 w-4 mr-2" />,
          activeVariant: variant,
        };
    }
  };

  const config = getButtonConfig();

  const getButtonClasses = () => {
    const baseClasses = className || "";
    
    // The previous design in ProfileRenderer:
    const followingClasses = "bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800";
    const followClasses = "bg-brand-purple border border-brand-purple/20 text-zinc-950 hover:bg-brand-purple/95 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] font-black";
    const disabledClasses = "opacity-50 cursor-not-allowed";

    let stateClasses = "";
    if (config.activeVariant === "secondary") {
      stateClasses = followingClasses;
    } else if (config.activeVariant === "destructive") {
      stateClasses = "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    } else {
      stateClasses = followClasses;
    }

    const disabledState = isPending || relationship.state === 'BLOCKED' || relationship.state === 'BLOCKED_BY' ? disabledClasses : "";

    return `${baseClasses} ${stateClasses} ${disabledState}`.trim();
  };

  return (
    <button
      className={getButtonClasses()}
      onClick={handleToggle}
      disabled={isPending || relationship.state === 'BLOCKED' || relationship.state === 'BLOCKED_BY'}
    >
      {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : config.icon}
      {config.label}
    </button>
  );
};
