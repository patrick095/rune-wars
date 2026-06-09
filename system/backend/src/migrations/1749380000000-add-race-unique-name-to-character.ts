import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRaceUniqueNameToCharacter1749380000000 implements MigrationInterface {
  name = 'AddRaceUniqueNameToCharacter1749380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "character" ADD COLUMN "race" character varying(20) NOT NULL DEFAULT 'human'`,
    );
    const duplicates = await queryRunner.query(
      `SELECT "name", COUNT(*)::int AS "count"
       FROM "character"
       GROUP BY "name"
       HAVING COUNT(*) > 1`,
    );
    if (duplicates.length > 0) {
      throw new Error(
        `Cannot add UQ_character_name because duplicate character names exist: ${duplicates
          .map((row: { name: string; count: number }) => `${row.name} (${row.count})`)
          .join(', ')}`,
      );
    }
    await queryRunner.query(
      `ALTER TABLE "character" ADD CONSTRAINT "UQ_character_name" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "character" DROP CONSTRAINT "UQ_character_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character" DROP COLUMN "race"`,
    );
  }
}
