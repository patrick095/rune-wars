import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAdminToUser1749500000000 implements MigrationInterface {
  name = 'AddIsAdminToUser1749500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS "is_admin" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP COLUMN IF EXISTS "is_admin"
    `);
  }
}
