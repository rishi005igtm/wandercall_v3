import { Column, CreateDateColumn, Entity, PrimaryColumn, Index } from 'typeorm';

@Entity('user_follows')
@Index(['followerId', 'followingId'], { unique: true })
@Index(['followerId'])
@Index(['followingId'])
export class FollowEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  followerId: string;

  @Column('uuid')
  followingId: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<FollowEntity>) {
    Object.assign(this, partial);
  }
}
