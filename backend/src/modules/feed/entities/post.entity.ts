import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  FOLLOWERS = 'FOLLOWERS',
  PRIVATE = 'PRIVATE',
}

export enum PostAuthorType {
  INDIVIDUAL = 'INDIVIDUAL',
  HOST = 'HOST',
  OFFICIAL = 'OFFICIAL',
  COMMUNITY = 'COMMUNITY',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  VALIDATING = 'VALIDATING',
  IMAGE_VERIFIED = 'IMAGE_VERIFIED',
  METADATA_GENERATED = 'METADATA_GENERATED',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

@Entity('posts')
@Index(['authorId'])
@Index(['category'])
@Index(['visibility'])
@Index(['status'])
@Index(['publishedAt'])
export class PostEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  authorId: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: PostAuthorType.INDIVIDUAL,
  })
  authorType: PostAuthorType;

  @Column()
  category: string;

  @Column()
  title: string; // Serves as experienceName or memoryTitle depending on category/type

  @Column({ type: 'text', nullable: true })
  content?: string; // Story details or memory description

  @Column({ type: 'simple-array', nullable: true })
  images?: string[]; // Array of Cloudinary URLs

  @Column({ type: 'simple-array', nullable: true })
  imagePublicIds?: string[]; // Array of Cloudinary public IDs

  @Column({ nullable: true })
  audioUrl?: string; // Voice snap Cloudinary URL

  @Column({ nullable: true })
  audioPublicId?: string; // Voice snap Cloudinary public ID

  @Column({ type: 'int', default: 0 })
  audioDuration: number; // Voice duration in seconds

  @Column({ nullable: true })
  locationName?: string; // Formatted address string

  @Column({ type: 'float', nullable: true })
  locationLat?: number;

  @Column({ type: 'float', nullable: true })
  locationLon?: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: PostVisibility.PUBLIC,
  })
  visibility: PostVisibility;

  @Column({
    type: 'varchar',
    length: 50,
    default: PostStatus.PUBLISHED,
  })
  status: PostStatus;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @Column({ type: 'int', default: 0 })
  saveCount: number;

  @Column({ type: 'int', default: 0 })
  shareCount: number;

  @Column({ type: 'float', default: 1.0 })
  aiQualityScore: number;

  @Column({ type: 'jsonb', nullable: true })
  aiMetadata?: any; // For future AI summaries or moderation tags

  @Column({ type: 'jsonb', nullable: true })
  searchMetadata?: any; // For future search index mappings

  @Column({ type: 'float', default: 0.0 })
  popularityScore: number;

  @Column({ type: 'float', default: 0.0 })
  trendingVelocity: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isArchived: boolean;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  countryCode?: string;

  @Column({ nullable: true })
  cityId?: string;

  @Column({ default: true })
  commentingEnabled: boolean;

  @Column({ default: false })
  allowRemix: boolean;

  @Column({ nullable: true })
  mediaAspectRatio?: string;

  @Column({ nullable: true })
  primaryImage?: string;

  @Column({ nullable: true })
  processingStatus?: string;

  @Column({ default: 'v1' })
  rankingVersion: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<PostEntity>) {
    Object.assign(this, partial);
  }
}
