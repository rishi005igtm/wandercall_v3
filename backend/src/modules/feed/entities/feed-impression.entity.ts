import { Column, CreateDateColumn, Entity, PrimaryColumn, Index } from 'typeorm';

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

  @CreateDateColumn()
  viewedAt: Date;

  constructor(partial: Partial<FeedImpressionEntity>) {
    Object.assign(this, partial);
  }
}
