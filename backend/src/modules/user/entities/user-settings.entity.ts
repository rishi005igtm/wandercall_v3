import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('users_settings')
export class UserSettingsEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column({ default: false })
  is2faEnabled: boolean;

  @Column({ type: 'json', nullable: true })
  privacyMatrix: any;

  @Column({ type: 'json', nullable: true })
  notifications: any;

  @Column({ default: 150 })
  travelRadius: number;

  @Column({ default: 250 })
  budgetRange: number;

  @Column({ default: 'Medium' })
  difficulty: string;

  @Column({ type: 'json', nullable: true })
  selectedTags: any;

  @Column({ type: 'json', nullable: true })
  connectedNetworks: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserSettingsEntity>) {
    Object.assign(this, partial);
  }
}
