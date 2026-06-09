import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPvpRoomPlayers1749391000000 implements MigrationInterface {
  name = 'AddPvpRoomPlayers1749391000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pvp_rooms"
      ADD COLUMN IF NOT EXISTS "ownerCharacterId" character varying,
      ADD COLUMN IF NOT EXISTS "playerIds" text NOT NULL DEFAULT ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pvp_rooms"
      DROP COLUMN IF EXISTS "playerIds",
      DROP COLUMN IF EXISTS "ownerCharacterId"
    `);
  }
}
