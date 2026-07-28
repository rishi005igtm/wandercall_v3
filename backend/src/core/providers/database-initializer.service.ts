import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseInitializerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseInitializerService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Clean up legacy orphan tables and deleted modules (Community & Campfire)
      try {
        await queryRunner.query(`DROP TABLE IF EXISTS "post_likes" CASCADE`);
        await queryRunner.query(
          `DROP TABLE IF EXISTS "interaction_events" CASCADE`,
        );
        await queryRunner.query(
          `DROP TABLE IF EXISTS "user_interactions" CASCADE`,
        );
        await queryRunner.query(
          `DROP TABLE IF EXISTS "feed_impressions" CASCADE`,
        );

        // Community Platform Tables
        await queryRunner.query(`DROP TABLE IF EXISTS "community_invites" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "community_bans" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "community_roles" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "community_members" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "community_settings" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "community_coordinates" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "community_saves" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "community_stats" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "community_galaxies" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "community_categories" CASCADE`);

        // Campfire Platform Tables
        await queryRunner.query(`DROP TABLE IF EXISTS "campfire_messages" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "live_sessions" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "campfires" CASCADE`);
        
        this.logger.log('Successfully dropped legacy and deleted module tables');
      } catch (err: unknown) {
        this.logger.warn('Failed to clean up legacy orphan tables or deleted module tables', err);
      }

      // Synchronize database schema once on server boot if needed
      await this.dataSource.synchronize();

      // ─────────────────────────────────────────────────────────────────────────
      // SEARCH ENGINE OPTIMIZATION (pg_trgm)
      // Enable pg_trgm extension and create trigram indexes for fast fuzzy search
      // ─────────────────────────────────────────────────────────────────────────
      try {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
        // We create GIN trigram indexes on the heavily searched fields
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS "idx_user_profile_username_trgm" 
          ON "users_profile" USING gin (username gin_trgm_ops);
        `);
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS "idx_user_profile_displayname_trgm" 
          ON "users_profile" USING gin ("displayName" gin_trgm_ops);
        `);
      } catch (err: unknown) {
        this.logger.warn(
          `pg_trgm setup notice: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // Ensure all existing users have a role assigned
      try {
        await queryRunner.query(
          `UPDATE users_auth SET role = 'INDIVIDUAL' WHERE role IS NULL`,
        );
      } catch (err: unknown) {
        this.logger.warn(
          `Database backfill notice: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // Backfill missing relational logs from user_post_state
      try {
        await queryRunner.query(`
          INSERT INTO post_saves ("id", "userId", "postId", "createdAt")
          SELECT gen_random_uuid(), "userId", "postId", CURRENT_TIMESTAMP
          FROM user_post_state
          WHERE "hasSaved" = true
          ON CONFLICT ("postId", "userId") DO NOTHING;
        `);
      } catch (err: unknown) {
        this.logger.warn(
          `Database backfill notice for relational logs: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // ─────────────────────────────────────────────────────────────────────────
      // CHAT INTEGRITY MIGRATION
      // Fixes duplicate DIRECT conversations caused by the race condition bug.
      // For each group of duplicate conversations (same participant pair):
      //   1. Identify the canonical conversation (the one with most messages, or most recent)
      //   2. Move all messages from orphan conversations to the canonical one
      //   3. Build the participantKey for the canonical conversation
      //   4. Delete orphan conversations (participants cascade)
      //   5. Add the unique constraint on participantKey
      // ─────────────────────────────────────────────────────────────────────────
      try {
        await this.runChatIntegrityMigration();
      } catch (err: unknown) {
        this.logger.warn(
          `Chat integrity migration notice: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // Removed Community Category and Role Seeding
    } catch (error) {
      this.logger.error(
        'Failed to initialize database tables on startup:',
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async runChatIntegrityMigration(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      // Step 1: Add participantKey column if it doesn't exist
      await queryRunner.query(`
        ALTER TABLE chat_conversations
        ADD COLUMN IF NOT EXISTS "participantKey" VARCHAR(100)
      `);

      // Step 2: Find all DIRECT conversations grouped by their participant pairs
      // For each pair, find the canonical conversation (has most messages; tie-break by oldest createdAt)
      const duplicateGroups = (await queryRunner.query(`
        SELECT
          string_agg(c.id::text, ',' ORDER BY
            (SELECT COUNT(*) FROM chat_messages m WHERE m."conversationId" = c.id) DESC,
            c."createdAt" ASC
          ) AS conv_ids,
          string_agg(p."userId"::text, ':' ORDER BY p."userId"::text ASC) AS participant_key,
          COUNT(c.id) AS conv_count
        FROM chat_conversations c
        JOIN chat_participants p ON p."conversationId" = c.id
        WHERE c.type = 'DIRECT'
        GROUP BY c.id
        HAVING COUNT(p.id) = 2
      `)) as Array<{ conv_ids: string; participant_key: string }>;

      // Re-group by participant key to find duplicates
      const groupsByKey: Record<string, string[]> = {};
      for (const row of duplicateGroups) {
        const key = row.participant_key;
        const id = row.conv_ids.split(',')[0]; // first is canonical (most messages, oldest)
        if (!groupsByKey[key]) groupsByKey[key] = [];
        groupsByKey[key].push(id);
      }

      // Collect all conversations per participant key
      const allConvsByKey = (await queryRunner.query(`
        SELECT
          c.id,
          c."createdAt",
          (SELECT COUNT(*) FROM chat_messages m WHERE m."conversationId" = c.id) AS msg_count,
          (
            SELECT string_agg(p."userId"::text, ':' ORDER BY p."userId"::text ASC)
            FROM chat_participants p
            WHERE p."conversationId" = c.id
          ) AS participant_key
        FROM chat_conversations c
        WHERE c.type = 'DIRECT'
        ORDER BY participant_key, msg_count DESC, c."createdAt" ASC
      `)) as Array<{ id: string; participant_key: string }>;

      // Group conversations by participant key
      const convsByParticipantKey: Record<
        string,
        Array<{ id: string; participant_key: string }>
      > = {};
      for (const row of allConvsByKey) {
        if (!row.participant_key) continue;
        if (!convsByParticipantKey[row.participant_key])
          convsByParticipantKey[row.participant_key] = [];
        convsByParticipantKey[row.participant_key].push(row);
      }

      let mergedCount = 0;
      let deletedCount = 0;

      for (const [participantKey, convs] of Object.entries(
        convsByParticipantKey,
      )) {
        if (convs.length === 0) continue;

        // The canonical conversation is the one with the most messages (first after ORDER BY)
        const canonical = convs[0];
        const orphans = convs.slice(1);

        // Set participantKey on canonical
        await queryRunner.query(
          `UPDATE chat_conversations SET "participantKey" = $1 WHERE id = $2`,
          [participantKey, canonical.id],
        );

        // Move messages from orphans to canonical
        for (const orphan of orphans) {
          const moved = await queryRunner.query(
            `UPDATE chat_messages SET "conversationId" = $1 WHERE "conversationId" = $2`,
            [canonical.id, orphan.id],
          );
          mergedCount += moved[1] ?? 0;

          // Merge participant lastReadAt state (take the most recent)
          await queryRunner.query(
            `
            UPDATE chat_participants cp_canonical
            SET "lastReadAt" = GREATEST(
              cp_canonical."lastReadAt",
              (SELECT cp_orphan."lastReadAt"
               FROM chat_participants cp_orphan
               WHERE cp_orphan."conversationId" = $1
                 AND cp_orphan."userId" = cp_canonical."userId"
               LIMIT 1)
            )
            WHERE cp_canonical."conversationId" = $2
          `,
            [orphan.id, canonical.id],
          );

          // Delete orphan conversation (participants cascade via FK)
          await queryRunner.query(
            `DELETE FROM chat_participants WHERE "conversationId" = $1`,
            [orphan.id],
          );
          await queryRunner.query(
            `DELETE FROM chat_conversations WHERE id = $1`,
            [orphan.id],
          );
          deletedCount++;
        }

        // Recalculate lastMessage summary on canonical after merge
        await queryRunner.query(
          `
          UPDATE chat_conversations SET
            "lastMessageId" = (SELECT id FROM chat_messages WHERE "conversationId" = $1 ORDER BY "createdAt" DESC LIMIT 1),
            "lastMessageText" = (SELECT LEFT(text, 100) FROM chat_messages WHERE "conversationId" = $1 AND "isDeleted" = false ORDER BY "createdAt" DESC LIMIT 1),
            "lastMessageSenderId" = (SELECT "senderId" FROM chat_messages WHERE "conversationId" = $1 ORDER BY "createdAt" DESC LIMIT 1),
            "lastMessageAt" = (SELECT "createdAt" FROM chat_messages WHERE "conversationId" = $1 ORDER BY "createdAt" DESC LIMIT 1)
          WHERE id = $1
        `,
          [canonical.id],
        );
      }

      // Step 3: Add unique constraint on participantKey (partial — only where not null)
      try {
        await queryRunner.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS "UQ_chat_conversations_participantKey"
          ON chat_conversations ("participantKey")
          WHERE "participantKey" IS NOT NULL
        `);
      } catch (err: unknown) {
        // Index may already exist — that's fine
        this.logger.debug(
          `Index notice: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      if (deletedCount > 0) {
        this.logger.log(
          `Merged ${mergedCount} messages and deleted ${deletedCount} orphan conversations.`,
        );
      } else {
        this.logger.debug('No orphan conversations found to merge.');
      }
    } finally {
      await queryRunner.release();
    }
  }

}
