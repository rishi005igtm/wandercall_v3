import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Google ID token is required' })
  idToken: string;
}
