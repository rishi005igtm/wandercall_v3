import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserAuthEntity } from '../entities/user-auth.entity';
import { UserSessionEntity } from '../entities/user-session.entity';
import { AccountStatus } from '../enums/account-status.enum';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(UserAuthEntity)
    private readonly userRepo: Repository<UserAuthEntity>,
    @InjectRepository(UserSessionEntity)
    private readonly sessionRepo: Repository<UserSessionEntity>,
  ) {}

  async findById(id: string): Promise<UserAuthEntity | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserAuthEntity | null> {
    return this.userRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(user: UserAuthEntity): Promise<UserAuthEntity> {
    user.email = user.email.toLowerCase();
    return this.userRepo.save(user);
  }

  async updateUser(user: UserAuthEntity): Promise<UserAuthEntity> {
    user.email = user.email.toLowerCase();
    return this.userRepo.save(user);
  }

  async updateStatus(
    userId: string,
    status: AccountStatus,
  ): Promise<UserAuthEntity | null> {
    await this.userRepo.update(userId, { accountStatus: status });
    return this.findById(userId);
  }

  async createSession(session: UserSessionEntity): Promise<UserSessionEntity> {
    return this.sessionRepo.save(session);
  }

  async saveSession(session: UserSessionEntity): Promise<UserSessionEntity> {
    return this.sessionRepo.save(session);
  }

  async findSessionById(sessionId: string): Promise<UserSessionEntity | null> {
    return this.sessionRepo.findOne({ where: { id: sessionId } });
  }

  async findActiveSessionByFingerprint(
    userId: string,
    deviceFingerprint: string,
  ): Promise<UserSessionEntity | null> {
    return this.sessionRepo.findOne({
      where: { userId, deviceFingerprint, isRevoked: false },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionRepo.update(sessionId, { isRevoked: true });
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.sessionRepo.delete(sessionId);
  }

  async deleteSessionByIdAndUser(
    sessionId: string,
    userId: string,
  ): Promise<void> {
    await this.sessionRepo.delete({ id: sessionId, userId });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepo.update({ userId }, { isRevoked: true });
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    await this.sessionRepo.delete({ userId });
  }

  async revokeOtherUserSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    await this.sessionRepo.update(
      { userId, id: Not(currentSessionId) },
      { isRevoked: true },
    );
  }

  async deleteOtherUserSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    await this.sessionRepo.delete({ userId, id: Not(currentSessionId) });
  }

  async findActiveSessionsByUserId(
    userId: string,
  ): Promise<UserSessionEntity[]> {
    return this.sessionRepo.find({
      where: { userId, isRevoked: false },
      order: { updatedAt: 'DESC' },
    });
  }
}
