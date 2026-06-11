import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCharacterConsumable1749500001000 implements MigrationInterface {
  name = 'CreateCharacterConsumable1749500001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "character_consumable" (
        "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "character_id"   uuid NOT NULL REFERENCES "character"("id") ON DELETE CASCADE,
        "consumable_id"  character varying(50) NOT NULL,
        "quantity"       integer NOT NULL DEFAULT 0,
        "created_at"     TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT "uq_char_consumable" UNIQUE ("character_id", "consumable_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_char_consumable_char"
      ON "character_consumable" ("character_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_char_consumable_char"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "character_consumable"`);
  }
}
