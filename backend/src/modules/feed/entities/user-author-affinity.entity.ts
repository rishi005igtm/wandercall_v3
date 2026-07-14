import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_author_affinity')
@Index(['userId', 'authorId'], { unique: true })
@Index(['userId'])
export class UserAuthorAffinityEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  authorId: string;

  @Column({ type: 'float', default: 0.0 })
  affinityScore: number;

  @Column({ type: 'int', default: 0 })
  interactionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastInteractionAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserAuthorAffinityEntity>) {
    Object.assign(this, partial);
  }
}
