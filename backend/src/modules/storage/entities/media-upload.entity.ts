import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum MediaUploadStatus {
  PENDING = 'PENDING',
  ATTACHED = 'ATTACHED',
}

@Entity('media_uploads')
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
export class MediaUploadEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  publicId: string;

  @Column()
  url: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: MediaUploadStatus.PENDING,
  })
  status: MediaUploadStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<MediaUploadEntity>) {
    Object.assign(this, partial);
  }
}
