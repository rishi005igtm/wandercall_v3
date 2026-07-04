import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatService } from '../services/chat.service';
import { PresenceService } from '../services/presence.service';

// ─────────────────────────────────────────────────────────
// Decorator — extract authenticated user from request
// ─────────────────────────────────────────────────────────
interface AuthUser {
  userId: string;
  email: string;
  role: string;
  accountStatus: string;
}

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * ChatController — HTTP REST endpoints for chat.
 *
 * Covers operations that are HTTP by nature:
 * - Fetching conversation list (page load)
 * - Fetching message history (pagination / initial load)
 * - Getting or creating a direct conversation (before socket connect)
 * - Deleting / editing a message
 *
 * Real-time operations (send, typing, read receipts) go through the Socket gateway.
 */
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly presenceService: PresenceService,
  ) {}

  /**
   * GET /api/v1/chat/conversations
   * Returns all conversations for the authenticated user.
   */
  @Get('conversations')
  async getConversations(@GetUser() user: AuthUser) {
    return this.chatService.getConversations(user.userId);
  }

  /**
   * POST /api/v1/chat/conversations/direct/:targetUserId
   * Get or create a direct conversation with a user.
   */
  @Post('conversations/direct/:targetUserId')
  async getOrCreateDirect(
    @GetUser() user: AuthUser,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.chatService.getOrCreateDirectConversation(user.userId, targetUserId);
  }

  /**
   * GET /api/v1/chat/conversations/:conversationId/messages
   * Cursor-based message history.
   */
  @Get('conversations/:conversationId/messages')
  async getMessages(
    @GetUser() user: AuthUser,
    @Param('conversationId') conversationId: string,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ) {
    return this.chatService.getMessages(user.userId, conversationId, limit, cursor);
  }

  /**
   * PATCH /api/v1/chat/messages/:messageId
   * Edit a message.
   */
  @Patch('messages/:messageId')
  async editMessage(
    @GetUser() user: AuthUser,
    @Param('messageId') messageId: string,
    @Body('text') text: string,
  ) {
    return this.chatService.editMessage(user.userId, messageId, text);
  }

  /**
   * DELETE /api/v1/chat/messages/:messageId
   * Soft-delete a message.
   */
  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMessage(
    @GetUser() user: AuthUser,
    @Param('messageId') messageId: string,
  ) {
    return this.chatService.deleteMessage(user.userId, messageId);
  }

  /**
   * GET /api/v1/chat/presence/:userId
   * Check whether a user is currently online.
   */
  @Get('presence/:userId')
  async getPresence(@Param('userId') userId: string) {
    const presence = this.presenceService.getPresence(userId);
    return {
      userId,
      isOnline: this.presenceService.isOnline(userId),
      status: presence?.status ?? 'OFFLINE',
      lastSeen: presence?.lastSeen,
    };
  }
}
