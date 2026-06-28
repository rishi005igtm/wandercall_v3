import { AccountStatus } from '../enums/account-status.enum';

export class AuthUserDto {
  id: string;
  email: string;
  name: string;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
}

export class AuthResponseDto {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
