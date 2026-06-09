import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePvpRooms1749390000000 implements MigrationInterface {
  name = 'CreatePvpRooms1749390000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "pvp_rooms" (
        "id"          uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name"        character varying NOT NULL,
        "mapName"     character varying NOT NULL DEFAULT 'plains',
        "playerCount" integer NOT NULL DEFAULT 1,
        "maxPlayers"  integer NOT NULL DEFAULT 2,
        "status"      character varying NOT NULL DEFAULT 'waiting',
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pvp_rooms" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "pvp_rooms"`);
  }
}
