import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('campfire_messages')
@Index(['campfireId', 'createdAt'])
export class CampfireMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  campfireId: string;

  @Column({ type: 'uuid' })
  senderId: string;

  @Column({ type: 'varchar', length: 255 })
  senderName: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  senderAvatar: string | null;

  @Column({ type: 'varchar', length: 50, default: 'Listener' })
  senderRole: string;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}
