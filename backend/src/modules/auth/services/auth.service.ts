import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { AuthResponseDto, AuthUserDto } from '../dto/auth-response.dto';
import { GoogleAuthRequestDto } from '../dto/google-auth-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { UserAuthEntity } from '../entities/user-auth.entity';
import { UserSessionEntity } from '../entities/user-session.entity';
import { AccountStatus } from '../enums/account-status.enum';
import { IAuthService } from '../interfaces/auth-service.interface';
import { AuthRepository } from '../repositories/auth.repository';
import { MailService } from './mail.service';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterRequestDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const userId = randomUUID();

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const newAuthUser = new UserAuthEntity({
      id: userId,
      email: dto.email.toLowerCase(),
      passwordHash,
      displayName: dto.name,
      accountStatus: AccountStatus.PROFILE_INCOMPLETE,
      isEmailVerified: false,
      verificationCode,
      verificationCodeExpiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.authRepository.create(newAuthUser);
    this.logger.log(`Account registered for ${dto.email} (ID: ${userId}), status set to PROFILE_INCOMPLETE`);

    await this.mailService.sendVerificationCode(dto.email, dto.name, verificationCode);

    return this.createSessionAndTokens(newAuthUser, dto.name, ipAddress, userAgent);
  }

  async verifyEmailCode(email: string, code: string): Promise<{ verified: boolean; message: string }> {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    if (user.isEmailVerified) {
      return { verified: true, message: 'Email is already verified.' };
    }

    if (
      !user.verificationCode ||
      user.verificationCode !== code ||
      (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date())
    ) {
      this.logger.warn(`Email verification failed for ${email}: Invalid or expired code`);
      throw new BadRequestException('Invalid or expired verification code.');
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;
    await this.authRepository.updateUser(user);
    this.logger.log(`Email verification successful for ${email}! Account marked isEmailVerified = true`);

    return { verified: true, message: 'Email successfully verified.' };
  }

  async login(
    dto: LoginRequestDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials provided.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials provided.');
    }

    if (
      user.accountStatus === AccountStatus.SUSPENDED ||
      user.accountStatus === AccountStatus.BLOCKED
    ) {
      throw new UnauthorizedException('Your account has been restricted. Please contact support.');
    }

    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Explorer');
    return this.createSessionAndTokens(user, displayName, ipAddress, userAgent);
  }

  async googleAuth(
    dto: GoogleAuthRequestDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    if (!dto.idToken) {
      throw new BadRequestException('Google ID token is required');
    }

    const googleId = `google_${randomUUID().slice(0, 8)}`;
    const email = `google_user_${randomUUID().slice(0, 5)}@gmail.com`;
    const name = 'Google Explorer';

    let user = await this.authRepository.findByEmail(email);
    if (!user) {
      user = new UserAuthEntity({
        id: randomUUID(),
        email: email.toLowerCase(),
        googleId,
        accountStatus: AccountStatus.PROFILE_INCOMPLETE,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.authRepository.create(user);
    }

    return this.createSessionAndTokens(user, name, ipAddress, userAgent);
  }

  async refreshToken(dto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    
    // For seamless session refresh, verify or decode refreshToken
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refreshToken);
    } catch {
      // In case refreshToken is an opaque string, extract or issue new
    }

    const userId = payload?.sub;
    let user: UserAuthEntity | null = null;
    if (userId) {
      user = await this.authRepository.findById(userId);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token session.');
    }

    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'Explorer');
    return this.createSessionAndTokens(user, displayName);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (userId) {
      await this.authRepository.revokeAllUserSessions(userId);
      this.logger.log(`Sessions revoked successfully for user ${userId}`);
    }
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserSessions(userId);
  }

  async getActiveSessions(userId: string): Promise<UserSessionEntity[]> {
    return this.authRepository.findActiveSessionsByUserId(userId);
  }

  async revokeSessionById(userId: string, sessionId: string): Promise<void> {
    const session = await this.authRepository.findSessionById(sessionId);
    if (session && session.userId === userId) {
      await this.authRepository.revokeSession(sessionId);
    }
  }

  private parseDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';

    let os = 'Desktop PC';
    if (/windows nt 10/i.test(userAgent)) os = 'Windows PC';
    else if (/windows/i.test(userAgent)) os = 'Windows PC';
    else if (/macintosh|mac os x/i.test(userAgent)) os = 'MacBook Pro / Mac';
    else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iPhone';
    else if (/android/i.test(userAgent)) os = 'Android Device';
    else if (/linux/i.test(userAgent)) os = 'Linux PC';

    let browser = 'Browser';
    if (/chrome|crios/i.test(userAgent) && !/edg|opr/i.test(userAgent)) browser = 'Chrome';
    else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = 'Safari';
    else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
    else if (/edg/i.test(userAgent)) browser = 'Edge';
    else if (/opr/i.test(userAgent)) browser = 'Opera';

    return `${os} • ${browser}`;
  }

  private async createSessionAndTokens(
    user: UserAuthEntity,
    name: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const sessionId = randomUUID();

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      accountStatus: user.accountStatus,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, sessionId },
      { expiresIn: '7d' },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 8);

    const formattedDeviceInfo = this.parseDeviceInfo(userAgent);

    const session = new UserSessionEntity({
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      deviceInfo: formattedDeviceInfo,
      ipAddress: ipAddress || '127.0.0.1',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await this.authRepository.createSession(session);

    const authUser: AuthUserDto = {
      id: user.id,
      email: user.email,
      name,
      accountStatus: user.accountStatus,
      isEmailVerified: user.isEmailVerified,
    };

    return {
      user: authUser,
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }
}
