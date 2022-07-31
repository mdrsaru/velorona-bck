import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMediaTable1659281385747 implements MigrationInterface {
  name = 'CreateMediaTable1659281385747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "media" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "url" character varying NOT NULL,
                CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "media"
        `);
  }
}
