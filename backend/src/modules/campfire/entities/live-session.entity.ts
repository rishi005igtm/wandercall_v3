import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CampfireEntity } from './campfire.entity';

export enum LiveSessionStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

@Entity('live_sessions')
@Index(['campfireId', 'status'])
export class LiveSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'campfire_id', type: 'uuid' })
  @Index()
  campfireId: string;

  @ManyToOne(() => CampfireEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campfire_id' })
  campfire: CampfireEntity;

  // The unique string we pass to LiveKit as the Room Name (e.g. "campfire-123-session-abc")
  @Column({ name: 'room_name', type: 'varchar', unique: true })
  roomName: string;

  @Column({ name: 'host_id', type: 'uuid' })
  hostId: string;

  @Column({
    type: 'enum',
    enum: LiveSessionStatus,
    default: LiveSessionStatus.ACTIVE,
  })
  status: LiveSessionStatus;

  @Column({ name: 'participant_count', type: 'int', default: 0 })
  participantCount: number;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
