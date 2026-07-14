export class RelationshipResponseDto {
  viewerFollowsTarget: boolean;
  targetFollowsViewer: boolean;
  state:
    | 'NOT_CONNECTED'
    | 'FOLLOWING'
    | 'FOLLOWED_BY'
    | 'MUTUAL_FOLLOW'
    | 'SELF'
    | 'BLOCKED'
    | 'BLOCKED_BY'
    | 'MUTED'
    | 'RESTRICTED'
    | 'PRIVATE_PENDING'
    | 'PRIVATE_ACCEPTED';
  canFollow: boolean;
  canFollowBack: boolean;
  canMessage: boolean;
  canInvite: boolean;
  isFriend: boolean;
}
