import { Column, CreateDateColumn, Entity, PrimaryColumn, Index } from 'typeorm';

@Entity('post_likes')
@Index(['postId', 'userId'], { unique: true })
@Index(['userId'])
@Index(['postId'])
export class PostLikeEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  postId: string;

  @Column('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<PostLikeEntity>) {
    Object.assign(this, partial);
  }
}
