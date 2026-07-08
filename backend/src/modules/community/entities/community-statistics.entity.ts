import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('community_statistics')
export class CommunityStatisticsEntity {
  @PrimaryColumn('uuid')
  communityId: string;

  @Column({ type: 'int', default: 1 })
  memberCount: number;

  @Column({ type: 'int', default: 1 })
  activeMembers: number;

  @Column({ type: 'int', default: 1 })
  onlineMembers: number;

  @Column({ type: 'int', default: 0 })
  storyCount: number;

  @Column({ type: 'int', default: 0 })
  postCount: number;

  @Column({ type: 'int', default: 0 })
  chatCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  growth: number;

  @UpdateDateColumn()
  updatedAt: Date;

  get totalMessageCount(): number {
    return this.chatCount || 0;
  }

  get totalPostCount(): number {
    return this.postCount || this.storyCount || 0;
  }

  get onlineMemberCount(): number {
    return this.onlineMembers || 1;
  }

  constructor(partial: Partial<CommunityStatisticsEntity>) {
    Object.assign(this, partial);
  }
}
