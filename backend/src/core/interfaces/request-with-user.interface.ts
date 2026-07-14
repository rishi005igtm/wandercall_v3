import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  role?: string;
  [key: string]: unknown;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
