import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AccountStatus } from '../enums/account-status.enum';
import { UserRole } from '../enums/user-role.enum';

@Entity('users_auth')
export class UserAuthEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash?: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.INDIVIDUAL,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.PROFILE_INCOMPLETE,
  })
  accountStatus: AccountStatus;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  verificationCode?: string;

  @Column({ type: 'timestamp', nullable: true })
  verificationCodeExpiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<UserAuthEntity>) {
    Object.assign(this, partial);
  }
}
