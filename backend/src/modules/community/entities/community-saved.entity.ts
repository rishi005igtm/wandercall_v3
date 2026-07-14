import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('community_saved')
@Index(['userId', 'communityId'], { unique: true })
export class CommunitySavedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid' })
  @Index()
  communityId: string;

  @CreateDateColumn()
  savedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  constructor(partial: Partial<CommunitySavedEntity>) {
    Object.assign(this, partial);
  }
}
