import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_post_state')
@Index(['userId', 'postId'], { unique: true })
@Index(['userId'])
@Index(['postId'])
export class UserPostStateEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  postId: string;

  @Column({ default: false })
  hasLiked: boolean;

  @Column({ default: false })
  hasSaved: boolean;

  @Column({ default: false })
  isHidden: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'float', default: 0 })
  totalVisibleTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastInteractionAt: Date;

  constructor(partial: Partial<UserPostStateEntity>) {
    Object.assign(this, partial);
  }
}
