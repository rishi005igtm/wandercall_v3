import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_search_history')
@Index(['userId', 'searchedAt'])
export class UserSearchHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  query: string;

  @Column({ type: 'json', nullable: true })
  filters?: Record<string, any>;

  @Column({ default: 0 })
  resultCount: number;

  @CreateDateColumn()
  searchedAt: Date;

  constructor(partial: Partial<UserSearchHistoryEntity>) {
    Object.assign(this, partial);
  }
}
