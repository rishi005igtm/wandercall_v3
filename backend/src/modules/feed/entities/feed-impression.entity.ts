import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('feed_impressions')
@Index(['userId', 'postId'], { unique: true })
@Index(['userId'])
export class FeedImpressionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  postId: string;

  @Column({ type: 'int', default: 1 })
  impressionCount: number;

  @Column({ type: 'int', default: 0 })
  totalVisibleDurationMs: number;

  @Column({ type: 'int', default: 0 })
  completedViews: number;

  @Column({ nullable: true })
  feedSessionId?: string;

  @Column({ type: 'float', default: 0 })
  lastVisiblePercent: number;

  @Column({ nullable: true })
  deviceType?: string;

  @Column({ nullable: true })
  sourceFeed?: string; // Home, Following, Explore, Trending

  @CreateDateColumn()
  firstViewedAt: Date;

  @UpdateDateColumn()
  lastViewedAt: Date;

  constructor(partial: Partial<FeedImpressionEntity>) {
    Object.assign(this, partial);
  }
}
