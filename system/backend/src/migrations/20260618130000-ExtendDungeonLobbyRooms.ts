import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendDungeonLobbyRooms20260618130000 implements MigrationInterface {
  name = 'ExtendDungeonLobbyRooms20260618130000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "dungeon_lobby"
      ADD COLUMN IF NOT EXISTS "difficulty" varchar NOT NULL DEFAULT 'easy',
      ADD COLUMN IF NOT EXISTS "max_members" integer NOT NULL DEFAULT 4,
      ADD COLUMN IF NOT EXISTS "slots" jsonb NOT NULL DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS "current_stage" integer NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "stage_count" integer NOT NULL DEFAULT 2,
      ADD COLUMN IF NOT EXISTS "portal_state" jsonb
    `);
    await queryRunner.query(`
      UPDATE "dungeon_lobby"
      SET "difficulty" = CASE "track"
        WHEN 'adventurers' THEN 'medium'
        WHEN 'champions' THEN 'hard'
        WHEN 'heroes' THEN 'heroic'
        ELSE 'easy'
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "dungeon_lobby"
      DROP COLUMN IF EXISTS "portal_state",
      DROP COLUMN IF EXISTS "stage_count",
      DROP COLUMN IF EXISTS "current_stage",
      DROP COLUMN IF EXISTS "slots",
      DROP COLUMN IF EXISTS "max_members",
      DROP COLUMN IF EXISTS "difficulty"
    `);
  }
}
