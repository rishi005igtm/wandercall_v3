import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CheckUsernameDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  username: string;
}
