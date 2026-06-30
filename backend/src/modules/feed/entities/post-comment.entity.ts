import { Column, CreateDateColumn, Entity, PrimaryColumn, Index } from 'typeorm';

@Entity('post_comments')
@Index(['postId'])
@Index(['userId'])
export class PostCommentEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<PostCommentEntity>) {
    Object.assign(this, partial);
  }
}
