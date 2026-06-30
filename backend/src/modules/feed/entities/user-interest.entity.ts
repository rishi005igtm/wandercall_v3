import { Column, Entity, PrimaryColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user_interests')
@Index(['userId', 'category'], { unique: true })
@Index(['userId'])
export class UserInterestEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  category: string;

  @Column({ type: 'float', default: 0.0 })
  score: number; // Cumulative affinity score

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserInterestEntity>) {
    Object.assign(this, partial);
  }
}
