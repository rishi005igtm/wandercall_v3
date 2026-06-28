import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { AccountStatus } from '../../auth/enums/account-status.enum';
import { CompleteProfileRequestDto } from '../dto/complete-profile-request.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async checkUsernameAvailability(username: string): Promise<{ available: boolean; username: string }> {
    const existing = await this.userRepository.findByUsername(username);
    return {
      available: !existing,
      username: username.toLowerCase(),
    };
  }

  async generateUsernameSuggestions(name: string): Promise<string[]> {
    const clean = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'explorer';
    const first = clean.slice(0, 8);
    const rand1 = Math.floor(10 + Math.random() * 89);
    const rand2 = Math.floor(100 + Math.random() * 899);
    const rand3 = Math.floor(10 + Math.random() * 89);

    const list = [
      `${first}_${rand1}`,
      `${clean}.${rand2}`,
      `${first}_x_${rand3}`,
      `${clean}_explorer`,
    ];

    const availableList: string[] = [];
    for (const sug of list) {
      const isTaken = await this.userRepository.findByUsername(sug);
      if (!isTaken) {
        availableList.push(sug);
      }
    }

    return availableList.length > 0 ? availableList : [`${clean}_${Date.now().toString().slice(-4)}`];
  }

  async completeProfile(dto: CompleteProfileRequestDto): Promise<UserProfileResponseDto> {
    const authUser = await this.authRepository.findById(dto.userId);
    if (!authUser) {
      throw new NotFoundException('User account not found.');
    }

    const usernameCheck = await this.checkUsernameAvailability(dto.username);
    const existingProfile = await this.userRepository.findByUserId(dto.userId);
    
    if (!usernameCheck.available && (!existingProfile || existingProfile.username.toLowerCase() !== dto.username.toLowerCase())) {
      throw new ConflictException('Username is already taken. Please choose another username.');
    }

    const profile = new UserProfileEntity({
      id: existingProfile ? existingProfile.id : randomUUID(),
      userId: dto.userId,
      username: dto.username.toLowerCase(),
      displayName: authUser.email.split('@')[0],
      avatarUrl: dto.avatarUrl || undefined,
      bio: dto.bio || undefined,
      locationFormatted: dto.locationFormatted || undefined,
      locationLat: dto.locationLat || undefined,
      locationLon: dto.locationLon || undefined,
      isPrivate: false,
      createdAt: existingProfile ? existingProfile.createdAt : new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.saveProfile(profile);

    // Staged Onboarding Phase 3: Transition account status to ACTIVE
    await this.authRepository.updateStatus(dto.userId, AccountStatus.ACTIVE);
    this.logger.log(`Profile setup complete for user ${dto.userId} (@${profile.username}). Account status transitioned to ACTIVE!`);

    return {
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      locationFormatted: profile.locationFormatted,
      locationLat: profile.locationLat,
      locationLon: profile.locationLon,
      isPrivate: profile.isPrivate,
      accountStatus: AccountStatus.ACTIVE,
      createdAt: profile.createdAt,
    };
  }

  async getProfileByUserId(userId: string): Promise<UserProfileResponseDto> {
    const profile = await this.userRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }
    const authUser = await this.authRepository.findById(userId);

    return {
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      locationFormatted: profile.locationFormatted,
      locationLat: profile.locationLat,
      locationLon: profile.locationLon,
      isPrivate: profile.isPrivate,
      accountStatus: authUser ? authUser.accountStatus : AccountStatus.ACTIVE,
      createdAt: profile.createdAt,
    };
  }
}
