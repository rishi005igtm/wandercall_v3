import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_sessions')
export class UserSessionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  refreshTokenHash: string;

  @Column({ nullable: true })
  deviceInfo?: string;

  @Column({ nullable: true })
  deviceType?: string;

  @Column({ nullable: true })
  operatingSystem?: string;

  @Column({ nullable: true })
  browser?: string;

  @Column({ nullable: true })
  deviceFingerprint?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastActive?: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserSessionEntity>) {
    Object.assign(this, partial);
  }
}
