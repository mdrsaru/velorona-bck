import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientTable1654663766022 implements MigrationInterface {
  name = 'CreateClientTable1654663766022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "clients" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "invoicingEmail" character varying NOT NULL,
                "archived" boolean NOT NULL DEFAULT false,
                "status" character varying NOT NULL DEFAULT 'Active',
                "address_id" uuid NOT NULL,
                "company_id" uuid,
                CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "client_name_index" ON "clients" ("name")
        `);
    await queryRunner.query(`
            CREATE INDEX "client_email_index" ON "clients" ("email")
        `);
    await queryRunner.query(`
            CREATE INDEX "client_archived_index" ON "clients" ("archived")
        `);
    await queryRunner.query(`
            CREATE INDEX "client_company_id_index" ON "clients" ("company_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "FK_10988406220d6ff391e315ba265" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "FK_fcadfe25d85cf21251273169128" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients" DROP CONSTRAINT "FK_fcadfe25d85cf21251273169128"
        `);
    await queryRunner.query(`
            ALTER TABLE "clients" DROP CONSTRAINT "FK_10988406220d6ff391e315ba265"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."client_company_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."client_archived_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."client_email_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."client_name_index"
        `);
    await queryRunner.query(`
            DROP TABLE "clients"
        `);
  }
}
