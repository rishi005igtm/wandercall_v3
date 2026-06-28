import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileEntity } from '../entities/user-profile.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly profileRepo: Repository<UserProfileEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserProfileEntity | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  async findByUsername(username: string): Promise<UserProfileEntity | null> {
    return this.profileRepo.findOne({ where: { username: username.toLowerCase() } });
  }

  async saveProfile(profile: UserProfileEntity): Promise<UserProfileEntity> {
    profile.username = profile.username.toLowerCase();
    return this.profileRepo.save(profile);
  }
}
