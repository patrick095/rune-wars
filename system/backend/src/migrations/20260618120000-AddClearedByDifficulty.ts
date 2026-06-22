import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClearedByDifficulty20260618120000 implements MigrationInterface {
  name = 'AddClearedByDifficulty20260618120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "dungeon_progress"
      ADD COLUMN IF NOT EXISTS "cleared_by_difficulty" jsonb
      NOT NULL DEFAULT '{"easy":0,"medium":0,"hard":0,"heroic":0}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "dungeon_progress"
      DROP COLUMN IF EXISTS "cleared_by_difficulty"
    `);
  }
}
