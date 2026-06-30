import { Column, CreateDateColumn, Entity, PrimaryColumn, Index } from 'typeorm';

export enum InteractionType {
  LIKE = 'LIKE',
  SAVE = 'SAVE',
  COMMENT = 'COMMENT',
  SHARE = 'SHARE',
  VIEW = 'VIEW',
}

@Entity('user_interactions')
@Index(['userId'])
@Index(['postId'])
export class UserInteractionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  postId: string;

  @Column()
  category: string; // Cached category of the post to speed up interest calculation

  @Column({
    type: 'varchar',
    length: 50,
  })
  interactionType: InteractionType;

  @Column({ type: 'float', default: 1.0 })
  weight: number; // Value metric representing impact

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<UserInteractionEntity>) {
    Object.assign(this, partial);
  }
}
