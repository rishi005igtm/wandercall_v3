import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Index,
} from 'typeorm';

@Entity('post_saves')
@Index(['postId', 'userId'], { unique: true })
@Index(['userId'])
@Index(['postId'])
export class PostSaveEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @Column('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<PostSaveEntity>) {
    Object.assign(this, partial);
  }
}
