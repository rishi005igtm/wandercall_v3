import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('users_profile')
@Index(['username', 'displayName'])
@Index(['reputationScore'])
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

  @Column({ nullable: true })
  avatarPublicId?: string;

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

  @Column({ nullable: true })
  profileUrl?: string;

  @Column({ nullable: true })
  coverImageUrl?: string;

  @Column({ nullable: true })
  coverImagePublicId?: string;

  @Column({ nullable: true })
  phoneCoordinate?: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 1000 })
  xpCurrent: number;

  @Column({ default: 2000 })
  xpNext: number;

  @Column({ default: 0 })
  reputationScore: number;

  @Column({ default: 0 })
  adventuresCompleted: number;

  @Column({ default: 0 })
  communitiesJoined: number;

  @Column({ default: 0 })
  campfiresHosted: number;

  @Column({ default: 0 })
  followerCount: number;

  @Column({ default: 0 })
  followingCount: number;

  @Column({ type: 'json', nullable: true })
  dnaBadges?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserProfileEntity>) {
    Object.assign(this, partial);
  }
}
