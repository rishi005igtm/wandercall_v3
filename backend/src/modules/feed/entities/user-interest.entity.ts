import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn, Index } from 'typeorm';

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
  rawScore: number; // Cumulative raw affinity score

  @Column({ type: 'float', default: 0.0 })
  normalizedScore: number; // Decayed, confidence-adjusted score

  @Column({ type: 'int', default: 0 })
  interactionCount: number;

  @Column({ type: 'float', default: 1.0 })
  decayFactor: number;

  @Column({ type: 'float', default: 0.1 })
  confidenceScore: number;

  @Column({ type: 'timestamp', nullable: true })
  lastDecay?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastInteractionAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserInterestEntity>) {
    Object.assign(this, partial);
  }
}
