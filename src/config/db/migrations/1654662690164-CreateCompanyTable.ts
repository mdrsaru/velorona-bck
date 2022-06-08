import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanyTable1654662690164 implements MigrationInterface {
  name = 'CreateCompanyTable1654662690164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "companies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'Inactive',
                "archived" boolean NOT NULL DEFAULT false,
                "company_code" character varying NOT NULL,
                "admin_email" character varying NOT NULL,
                CONSTRAINT "UQ_c59133f1df5217119eedb39754c" UNIQUE ("company_code"),
                CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "companies_status" ON "companies" ("status")
        `);
    await queryRunner.query(`
            CREATE INDEX "companies_archived" ON "companies" ("archived")
        `);
    await queryRunner.query(`
            CREATE INDEX "companies_company_code" ON "companies" ("company_code")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."companies_company_code"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."companies_archived"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."companies_status"
        `);
    await queryRunner.query(`
            DROP TABLE "companies"
        `);
  }
}
