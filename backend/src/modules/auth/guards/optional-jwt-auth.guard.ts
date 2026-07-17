import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: unknown,
  ): TUser | null {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
