import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users_plan')
export class UserPlanEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column({ default: 'free' })
  selectedTier: string;

  @Column({ default: 'monthly' })
  billingCycle: string;

  @Column({ type: 'float', default: 0 })
  price: number;

  @Column({ default: 'INACTIVE' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  nextBillDate?: Date;

  @Column({ type: 'json', nullable: true })
  paymentCard?: unknown;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserPlanEntity>) {
    Object.assign(this, partial);
  }
}
