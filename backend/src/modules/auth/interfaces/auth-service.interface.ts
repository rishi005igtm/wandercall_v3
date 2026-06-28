import { RegisterRequestDto } from '../dto/register-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { GoogleAuthRequestDto } from '../dto/google-auth-request.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

export interface IAuthService {
  register(dto: RegisterRequestDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto>;
  login(dto: LoginRequestDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto>;
  googleAuth(dto: GoogleAuthRequestDto, ipAddress?: string, userAgent?: string): Promise<AuthResponseDto>;
  refreshToken(dto: RefreshTokenRequestDto): Promise<AuthResponseDto>;
  logout(userId: string, refreshToken?: string): Promise<void>;
  revokeAllSessions(userId: string): Promise<void>;
}
