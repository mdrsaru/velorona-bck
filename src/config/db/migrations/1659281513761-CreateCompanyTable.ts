import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanyTable1659281513761 implements MigrationInterface {
  name = 'CreateCompanyTable1659281513761';

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
                "logo_id" uuid,
                "admin_email" character varying NOT NULL,
                "stripe_customer_id" character varying,
                "plan" character varying DEFAULT 'Starter',
                "subscription_id" character varying,
                "subscription_item_id" character varying,
                "subscription_status" character varying,
                CONSTRAINT "UQ_c59133f1df5217119eedb39754c" UNIQUE ("company_code"),
                CONSTRAINT "REL_762447c46ea5c7b1602ace3144" UNIQUE ("logo_id"),
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
    await queryRunner.query(`
            CREATE INDEX "companies_admin_email" ON "companies" ("admin_email")
        `);
    await queryRunner.query(`
            CREATE INDEX "companies_subscription_id" ON "companies" ("subscription_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD CONSTRAINT "FK_762447c46ea5c7b1602ace3144e" FOREIGN KEY ("logo_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies" DROP CONSTRAINT "FK_762447c46ea5c7b1602ace3144e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."companies_subscription_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."companies_admin_email"
        `);
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
