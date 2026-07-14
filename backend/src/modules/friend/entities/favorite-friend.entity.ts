import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserProfileEntity } from '../../user/entities/user-profile.entity';

@Entity('user_favorite_friends')
@Index(['userId', 'friendId'], { unique: true })
@Index(['userId', 'displayOrder'])
export class FavoriteFriendEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  friendId: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @ManyToOne(() => UserProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: UserProfileEntity;

  @ManyToOne(() => UserProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'friendId', referencedColumnName: 'userId' })
  friend: UserProfileEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<FavoriteFriendEntity>) {
    Object.assign(this, partial);
  }
}
