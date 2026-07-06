import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('community_roles')
export class CommunityRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string; // e.g., 'OWNER', 'ADMIN', 'MODERATOR', 'MEMBER', 'VIP', 'GUIDE'

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
