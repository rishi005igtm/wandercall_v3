import { AccountStatus } from '../enums/account-status.enum';
import { UserRole } from '../enums/user-role.enum';

export class AuthUserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
}

export class AuthResponseDto {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
