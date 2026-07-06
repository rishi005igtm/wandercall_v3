import { Column, Entity, PrimaryColumn } from 'typeorm';
import { CommunityJoinPolicy } from '../constants/community.constant';

@Entity('community_settings')
export class CommunitySettingsEntity {
  @PrimaryColumn('uuid')
  communityId: string;

  @Column({ type: 'boolean', default: false })
  approvalRequired: boolean;

  @Column({ type: 'boolean', default: true })
  public: boolean;

  @Column({ type: 'boolean', default: false })
  private: boolean;

  @Column({ type: 'boolean', default: false })
  hidden: boolean;

  @Column({ type: 'boolean', default: true })
  allowInvite: boolean;

  @Column({ type: 'boolean', default: true })
  allowStories: boolean;

  @Column({ type: 'boolean', default: true })
  allowChat: boolean;

  @Column({ type: 'boolean', default: true })
  discoverable: boolean;

  @Column({ type: 'varchar', length: 20, default: CommunityJoinPolicy.OPEN })
  joinPolicy: CommunityJoinPolicy;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  region?: string;

  constructor(partial: Partial<CommunitySettingsEntity>) {
    Object.assign(this, partial);
  }
}
