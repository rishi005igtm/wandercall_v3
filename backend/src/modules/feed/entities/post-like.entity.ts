import { Column, CreateDateColumn, Entity, PrimaryColumn, Index } from 'typeorm';

@Entity('post_likes')
@Index(['userId', 'postId'], { unique: true })
@Index(['userId'])
@Index(['postId'])
export class PostLikeEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  postId: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<PostLikeEntity>) {
    Object.assign(this, partial);
  }
}
