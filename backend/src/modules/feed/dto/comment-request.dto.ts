import { IsNotEmpty, IsString } from 'class-validator';

export class CommentRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment content cannot be empty.' })
  content: string;
}
