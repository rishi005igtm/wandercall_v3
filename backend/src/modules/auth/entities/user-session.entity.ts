import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

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
  ipAddress?: string;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<UserSessionEntity>) {
    Object.assign(this, partial);
  }
}
