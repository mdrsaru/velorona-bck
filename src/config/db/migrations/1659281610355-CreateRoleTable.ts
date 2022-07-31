import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1659281610355 implements MigrationInterface {
  name = 'CreateRoleTable1659281610355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL DEFAULT 'CompanyAdmin',
                "description" character varying,
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_648e3f5447f725579d7d4ffdfb" ON "roles" ("name")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."IDX_648e3f5447f725579d7d4ffdfb"
        `);
    await queryRunner.query(`
            DROP TABLE "roles"
        `);
  }
}
