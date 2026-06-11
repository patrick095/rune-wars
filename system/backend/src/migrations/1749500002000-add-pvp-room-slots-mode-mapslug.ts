import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPvpRoomSlotsModeMapslug1749500002000 implements MigrationInterface {
  name = 'AddPvpRoomSlotsModeMapslug1749500002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // "slots" — JSONB array for room slot metadata
    await queryRunner.query(`
      ALTER TABLE "pvp_rooms"
      ADD COLUMN IF NOT EXISTS "slots" jsonb NOT NULL DEFAULT '[]'
    `);

    // "mode" — game mode (free, ranked, etc.)
    await queryRunner.query(`
      ALTER TABLE "pvp_rooms"
      ADD COLUMN IF NOT EXISTS "mode" character varying(20) NOT NULL DEFAULT 'free'
    `);

    // "map_slug" — slug identifier for the map asset, separate from legacy "mapName"
    await queryRunner.query(`
      ALTER TABLE "pvp_rooms"
      ADD COLUMN IF NOT EXISTS "map_slug" character varying(50) NOT NULL DEFAULT 'plains'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pvp_rooms"
      DROP COLUMN IF EXISTS "map_slug",
      DROP COLUMN IF EXISTS "mode",
      DROP COLUMN IF EXISTS "slots"
    `);
  }
}
