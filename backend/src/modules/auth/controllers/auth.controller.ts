import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { GoogleAuthRequestDto } from '../dto/google-auth-request.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserSessionEntity } from '../entities/user-session.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterRequestDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.register(dto, ip, userAgent);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body('email') email: string,
    @Body('code') code: string,
  ): Promise<{ verified: boolean; message: string }> {
    return this.authService.verifyEmailCode(email, code);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.login(dto, ip, userAgent);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Body() dto: GoogleAuthRequestDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    return this.authService.googleAuth(dto, ip, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body('userId') userId: string): Promise<{ message: string }> {
    await this.authService.logout(userId);
    return { message: 'Successfully logged out and session revoked.' };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getActiveSessions(@Req() req: any): Promise<UserSessionEntity[]> {
    return this.authService.getActiveSessions(req.user.userId);
  }

  @Post('sessions/revoke/:sessionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
  ): Promise<{ message: string }> {
    await this.authService.revokeSessionById(req.user.userId, sessionId);
    return { message: 'Session successfully revoked.' };
  }
}
