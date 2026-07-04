import { Column, CreateDateColumn, Entity, PrimaryColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { UserProfileEntity } from './user-profile.entity';

@Entity('user_follows')
@Index(['followerId', 'followingId'], { unique: true })
@Index(['followerId', 'createdAt'])
@Index(['followingId', 'createdAt'])
@Index(['followerId'])
@Index(['followingId'])
export class FollowEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  followerId: string;

  @Column('uuid')
  followingId: string;

  @ManyToOne(() => UserProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId', referencedColumnName: 'userId' })
  follower: UserProfileEntity;

  @ManyToOne(() => UserProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId', referencedColumnName: 'userId' })
  following: UserProfileEntity;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<FollowEntity>) {
    Object.assign(this, partial);
  }
}

