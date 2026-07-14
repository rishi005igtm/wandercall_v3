import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('community_roles')
export class CommunityRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // e.g., 'OWNER', 'ADMIN', 'MODERATOR', 'MEMBER', 'VIP', 'GUIDE'

  @Column({ type: 'varchar', length: 100, nullable: true })
  displayName?: string;

  @Column({ type: 'varchar', length: 20, default: '#3B82F6' })
  displayColor: string;

  @Column({ type: 'int', default: 100 })
  priority: number; // 1 = OWNER (highest), 10 = ADMIN, 20 = MODERATOR, 100 = MEMBER

  @Column({ type: 'boolean', default: false })
  systemRole: boolean;

  @Column({ type: 'boolean', default: true })
  editable: boolean;

  @Column({ type: 'boolean', default: false })
  protected: boolean;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[]; // e.g., ['member.kick', 'member.ban', 'settings.update']

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<CommunityRoleEntity>) {
    Object.assign(this, partial);
  }
}
