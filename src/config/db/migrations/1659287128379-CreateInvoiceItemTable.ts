import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoiceItemTable1659287128379 implements MigrationInterface {
  name = 'CreateInvoiceItemTable1659287128379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "invoice_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "invoice_id" uuid NOT NULL,
                "project_id" uuid NOT NULL,
                "description" character varying,
                "quantity" double precision NOT NULL,
                "rate" double precision NOT NULL,
                "amount" double precision NOT NULL,
                CONSTRAINT "PK_53b99f9e0e2945e69de1a12b75a" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "invoice_items_invoice_id" ON "invoice_items" ("invoice_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "invoice_items_project_id" ON "invoice_items" ("project_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice_items"
            ADD CONSTRAINT "FK_dc991d555664682cfe892eea2c1" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice_items"
            ADD CONSTRAINT "FK_0f0a8ef3c1f06792eee6d36232e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_0f0a8ef3c1f06792eee6d36232e"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_dc991d555664682cfe892eea2c1"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."invoice_items_project_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."invoice_items_invoice_id"
        `);
    await queryRunner.query(`
            DROP TABLE "invoice_items"
        `);
  }
}
