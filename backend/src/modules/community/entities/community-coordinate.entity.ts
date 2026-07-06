import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('community_coordinates')
@Index(['latitude', 'longitude'])
export class CommunityCoordinateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  categoryId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  geohash: string;

  @Column({ type: 'varchar', length: 255 })
  coordinateName: string;

  @Column({ type: 'tsvector', select: false, nullable: true })
  @Index('idx_community_coordinate_search', { synchronize: false })
  searchIndex?: any;

  constructor(partial: Partial<CommunityCoordinateEntity>) {
    Object.assign(this, partial);
  }
}
