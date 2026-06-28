import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('users_profile')
export class UserProfileEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column()
  displayName: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true, type: 'text' })
  bio?: string;

  @Column({ nullable: true })
  locationFormatted?: string;

  @Column({ nullable: true, type: 'float' })
  locationLat?: number;

  @Column({ nullable: true, type: 'float' })
  locationLon?: number;

  @Column({ default: false })
  isPrivate: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserProfileEntity>) {
    Object.assign(this, partial);
  }
}
