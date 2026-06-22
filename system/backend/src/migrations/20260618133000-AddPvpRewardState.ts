import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPvpRewardState20260618133000 implements MigrationInterface {
  name = 'AddPvpRewardState20260618133000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pvp_rooms"
      ADD COLUMN IF NOT EXISTS "reward_state" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pvp_rooms"
      DROP COLUMN IF EXISTS "reward_state"
    `);
  }
}
