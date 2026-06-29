import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthRepository } from '../../auth/repositories/auth.repository';
import { AccountStatus } from '../../auth/enums/account-status.enum';
import { CompleteProfileRequestDto } from '../dto/complete-profile-request.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { UpdateProfileRequestDto } from '../dto/update-profile-request.dto';
import { UserSettingsDto } from '../dto/user-settings-dto';
import { UserPlanDto } from '../dto/user-plan-dto';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserSettingsEntity } from '../entities/user-settings.entity';
import { UserPlanEntity } from '../entities/user-plan.entity';
import { UserRepository } from '../repositories/user.repository';
import { StorageService } from '../../storage/services/storage.service';
import { UploadIntent } from '../../storage/enums/upload-intent.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly storageService: StorageService,
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

  private async ensureDefaultSettings(userId: string): Promise<UserSettingsEntity> {
    let settings = await this.userRepository.findSettingsByUserId(userId);
    if (!settings) {
      settings = new UserSettingsEntity({
        id: randomUUID(),
        userId,
        is2faEnabled: false,
        privacyMatrix: {
          profile: 'public',
          friends: 'public',
          communities: 'public',
          campfires: 'friends',
        },
        notifications: {
          bookings: true,
          communities: true,
          campfires: false,
          friends: true,
          messages: true,
          quests: true,
          experiences: false,
          promotions: false,
          system: true,
        },
        travelRadius: 150,
        budgetRange: 250,
        difficulty: 'Medium',
        selectedTags: [
          'Adventure',
          'Food',
          'Learning',
          'Nightlife',
          'Photography',
          'Storytelling',
          'Fitness',
          'Travel',
          'Water Activities',
        ],
        connectedNetworks: {
          google: { connected: false },
          discord: { connected: false },
          instagram: { connected: false },
          x: { connected: false },
        },
      });
      await this.userRepository.saveSettings(settings);
      this.logger.log(`Automatically provisioned default user settings for userId ${userId}`);
    }
    return settings;
  }

  private async ensureDefaultPlan(userId: string): Promise<UserPlanEntity> {
    let plan = await this.userRepository.findPlanByUserId(userId);
    if (!plan) {
      plan = new UserPlanEntity({
        id: randomUUID(),
        userId,
        selectedTier: 'free',
        billingCycle: 'monthly',
        price: 0,
        status: 'INACTIVE',
        nextBillDate: undefined,
        paymentCard: null,
      });
      await this.userRepository.savePlan(plan);
      this.logger.log(`Automatically provisioned default user plan for userId ${userId}`);
    }
    return plan;
  }

  async completeProfile(dto: CompleteProfileRequestDto): Promise<UserProfileResponseDto> {
    const authUser = await this.authRepository.findById(dto.userId);
    if (!authUser) {
      throw new NotFoundException('User account not found.');
    }

    if (!authUser.isEmailVerified) {
      throw new ForbiddenException('Email address must be verified before completing profile setup.');
    }

    const usernameCheck = await this.checkUsernameAvailability(dto.username);
    const existingProfile = await this.userRepository.findByUserId(dto.userId);
    
    if (!usernameCheck.available && (!existingProfile || existingProfile.username.toLowerCase() !== dto.username.toLowerCase())) {
      throw new ConflictException('Username is already taken. Please choose another username.');
    }

    const displayName = dto.displayName || authUser.displayName || (authUser.email ? authUser.email.split('@')[0] : 'Explorer');
    const cleanUsername = dto.username.toLowerCase();
    const generatedProfileUrl = `https://wandercall.io/${cleanUsername}`;

    const profile = new UserProfileEntity({
      id: existingProfile ? existingProfile.id : randomUUID(),
      userId: dto.userId,
      username: cleanUsername,
      displayName: dto.displayName || existingProfile?.displayName || authUser.displayName || (authUser.email ? authUser.email.split('@')[0] : 'Explorer'),
      avatarUrl: dto.avatarUrl || existingProfile?.avatarUrl || undefined,
      bio: dto.bio || existingProfile?.bio || undefined,
      locationFormatted: dto.locationFormatted || existingProfile?.locationFormatted || undefined,
      locationLat: dto.locationLat || existingProfile?.locationLat || undefined,
      locationLon: dto.locationLon || existingProfile?.locationLon || undefined,
      isPrivate: false,
      profileUrl: existingProfile?.profileUrl || generatedProfileUrl,
      coverImageUrl: existingProfile?.coverImageUrl || undefined,
      phoneCoordinate: existingProfile?.phoneCoordinate || undefined,
      level: existingProfile ? existingProfile.level : 1,
      xpCurrent: existingProfile ? existingProfile.xpCurrent : 1000,
      xpNext: existingProfile ? existingProfile.xpNext : 2000,
      reputationScore: existingProfile ? existingProfile.reputationScore : 0,
      adventuresCompleted: existingProfile ? existingProfile.adventuresCompleted : 0,
      communitiesJoined: existingProfile ? existingProfile.communitiesJoined : 0,
      campfiresHosted: existingProfile ? existingProfile.campfiresHosted : 0,
      dnaBadges: existingProfile ? existingProfile.dnaBadges : null,
      createdAt: existingProfile ? existingProfile.createdAt : new Date(),
      updatedAt: new Date(),
    });

    await this.userRepository.saveProfile(profile);

    await this.ensureDefaultSettings(dto.userId);
    await this.ensureDefaultPlan(dto.userId);

    await this.authRepository.updateStatus(dto.userId, AccountStatus.ACTIVE);
    this.logger.log(`Profile setup complete for user ${dto.userId} (@${profile.username}). Account status transitioned to ACTIVE!`);

    return this.mapProfileToDto(profile, AccountStatus.ACTIVE);
  }

  async getProfileByUserId(userId: string): Promise<UserProfileResponseDto> {
    let profile = await this.userRepository.findByUserId(userId);
    const authUser = await this.authRepository.findById(userId);

    if (!profile) {
      if (!authUser) {
        throw new NotFoundException('User profile not found.');
      }
      const defaultUsername = authUser.email.split('@')[0].toLowerCase();
      profile = new UserProfileEntity({
        id: randomUUID(),
        userId,
        username: defaultUsername,
        displayName: authUser.email.split('@')[0],
        profileUrl: `https://wandercall.io/${defaultUsername}`,
        phoneCoordinate: undefined,
        level: 1,
        xpCurrent: 1000,
        xpNext: 2000,
        reputationScore: 0,
        adventuresCompleted: 0,
        communitiesJoined: 0,
        campfiresHosted: 0,
        dnaBadges: null,
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.userRepository.saveProfile(profile);
    }

    await this.ensureDefaultSettings(userId);
    await this.ensureDefaultPlan(userId);

    return this.mapProfileToDto(profile, authUser ? authUser.accountStatus : AccountStatus.ACTIVE);
  }

  async updateProfile(userId: string, dto: UpdateProfileRequestDto): Promise<UserProfileResponseDto> {
    const profile = await this.userRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found for user');
    }

    if (dto.displayName !== undefined) profile.displayName = dto.displayName;
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.avatarUrl !== undefined) profile.avatarUrl = dto.avatarUrl;
    if (dto.avatarPublicId !== undefined) profile.avatarPublicId = dto.avatarPublicId;
    if (dto.coverImageUrl !== undefined) profile.coverImageUrl = dto.coverImageUrl;
    if (dto.coverImagePublicId !== undefined) profile.coverImagePublicId = dto.coverImagePublicId;
    if (dto.locationFormatted !== undefined) profile.locationFormatted = dto.locationFormatted;
    if (dto.phoneCoordinate !== undefined) profile.phoneCoordinate = dto.phoneCoordinate;

    profile.updatedAt = new Date();
    await this.userRepository.saveProfile(profile);

    const authUser = await this.authRepository.findById(userId);
    return this.mapProfileToDto(profile, authUser ? authUser.accountStatus : AccountStatus.ACTIVE);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<UserProfileResponseDto> {
    let profile = await this.userRepository.findByUserId(userId);
    if (!profile) {
      await this.getProfileByUserId(userId);
      profile = (await this.userRepository.findByUserId(userId))!;
    }

    const oldPublicId = profile.avatarPublicId || '';
    const metadata = await this.storageService.replaceFile(
      file,
      oldPublicId,
      UploadIntent.PROFILE_AVATAR,
      userId,
    );

    profile.avatarUrl = metadata.secureUrl;
    profile.avatarPublicId = metadata.publicId;
    profile.updatedAt = new Date();
    await this.userRepository.saveProfile(profile);

    const authUser = await this.authRepository.findById(userId);
    return this.mapProfileToDto(profile, authUser ? authUser.accountStatus : AccountStatus.ACTIVE);
  }

  async uploadCoverImage(userId: string, file: Express.Multer.File): Promise<UserProfileResponseDto> {
    let profile = await this.userRepository.findByUserId(userId);
    if (!profile) {
      await this.getProfileByUserId(userId);
      profile = (await this.userRepository.findByUserId(userId))!;
    }

    const oldPublicId = profile.coverImagePublicId || '';
    const metadata = await this.storageService.replaceFile(
      file,
      oldPublicId,
      UploadIntent.PROFILE_BANNER,
      userId,
    );

    profile.coverImageUrl = metadata.secureUrl;
    profile.coverImagePublicId = metadata.publicId;
    profile.updatedAt = new Date();
    await this.userRepository.saveProfile(profile);

    const authUser = await this.authRepository.findById(userId);
    return this.mapProfileToDto(profile, authUser ? authUser.accountStatus : AccountStatus.ACTIVE);
  }

  async getSettings(userId: string): Promise<UserSettingsDto> {
    const settings = await this.ensureDefaultSettings(userId);
    return {
      userId: settings.userId,
      is2faEnabled: settings.is2faEnabled,
      privacyMatrix: settings.privacyMatrix,
      notifications: settings.notifications,
      travelRadius: settings.travelRadius,
      budgetRange: settings.budgetRange,
      difficulty: settings.difficulty,
      selectedTags: settings.selectedTags,
      connectedNetworks: settings.connectedNetworks,
    };
  }

  async updateSettings(userId: string, partial: Partial<UserSettingsDto>): Promise<UserSettingsDto> {
    const settings = await this.ensureDefaultSettings(userId);
    Object.assign(settings, partial);
    settings.updatedAt = new Date();
    await this.userRepository.saveSettings(settings);
    return this.getSettings(userId);
  }

  async getPlan(userId: string): Promise<UserPlanDto> {
    const plan = await this.ensureDefaultPlan(userId);
    return {
      userId: plan.userId,
      selectedTier: plan.selectedTier,
      billingCycle: plan.billingCycle,
      price: plan.price,
      status: plan.status,
      nextBillDate: plan.nextBillDate,
      paymentCard: plan.paymentCard,
    };
  }

  async updatePlan(userId: string, partial: Partial<UserPlanDto>): Promise<UserPlanDto> {
    const plan = await this.ensureDefaultPlan(userId);
    Object.assign(plan, partial);
    plan.updatedAt = new Date();
    await this.userRepository.savePlan(plan);
    return this.getPlan(userId);
  }

  private async mapProfileToDto(profile: UserProfileEntity, accountStatus: string): Promise<UserProfileResponseDto> {
    const authUser = await this.authRepository.findById(profile.userId);
    return {
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      email: authUser?.email || '',
      isEmailVerified: authUser?.isEmailVerified ?? false,
      avatarUrl: profile.avatarUrl,
      avatarPublicId: profile.avatarPublicId,
      bio: profile.bio,
      locationFormatted: profile.locationFormatted,
      locationLat: profile.locationLat,
      locationLon: profile.locationLon,
      isPrivate: profile.isPrivate,
      profileUrl: profile.profileUrl || `https://wandercall.io/${profile.username}`,
      coverImageUrl: profile.coverImageUrl,
      coverImagePublicId: profile.coverImagePublicId,
      phoneCoordinate: profile.phoneCoordinate,
      level: profile.level ?? 1,
      xpCurrent: profile.xpCurrent ?? 1000,
      xpNext: profile.xpNext ?? 2000,
      reputationScore: profile.reputationScore ?? 0,
      adventuresCompleted: profile.adventuresCompleted ?? 0,
      communitiesJoined: profile.communitiesJoined ?? 0,
      campfiresHosted: profile.campfiresHosted ?? 0,
      dnaBadges: profile.dnaBadges,
      accountStatus,
      createdAt: profile.createdAt,
    };
  }
}
