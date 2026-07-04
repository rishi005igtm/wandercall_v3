import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_recommendation_cache')
@Index(['userId', 'recommendedUserId', 'category'], { unique: true })
@Index(['userId', 'score'])
export class UserRecommendationCacheEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  recommendedUserId: string;

  @Column({ type: 'float', default: 0.0 })
  score: number;

  @Column({ type: 'json', nullable: true })
  reasons?: string[];

  @Column({ default: 'friend' })
  category: string; // 'friend', 'circle', 'partner'

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<UserRecommendationCacheEntity>) {
    Object.assign(this, partial);
  }
}
