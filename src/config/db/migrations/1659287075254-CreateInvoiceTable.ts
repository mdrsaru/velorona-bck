import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoiceTable1659287075254 implements MigrationInterface {
  name = 'CreateInvoiceTable1659287075254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "invoices" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "status" character varying NOT NULL DEFAULT 'Pending',
                "verified" boolean NOT NULL DEFAULT false,
                "issue_date" TIMESTAMP NOT NULL,
                "due_date" TIMESTAMP NOT NULL,
                "invoice_number" SERIAL NOT NULL,
                "po_number" character varying,
                "total_quantity" double precision NOT NULL,
                "subtotal" double precision NOT NULL,
                "total_amount" double precision NOT NULL,
                "taxPercent" double precision,
                "taxAmount" double precision DEFAULT '0',
                "notes" character varying,
                "company_id" uuid NOT NULL,
                "client_id" uuid NOT NULL,
                "timesheet_id" uuid,
                CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "invoices_status" ON "invoices" ("status")
        `);
    await queryRunner.query(`
            CREATE INDEX "invoices_company_id" ON "invoices" ("company_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "invoices_client_id" ON "invoices" ("client_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD CONSTRAINT "FK_42385e42f092f26bd38df549717" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD CONSTRAINT "FK_5534ba11e10f1a9953cbdaabf16" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD CONSTRAINT "FK_5b9eb60550f3897377c1b8709d2" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP CONSTRAINT "FK_5b9eb60550f3897377c1b8709d2"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP CONSTRAINT "FK_5534ba11e10f1a9953cbdaabf16"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP CONSTRAINT "FK_42385e42f092f26bd38df549717"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."invoices_client_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."invoices_company_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."invoices_status"
        `);
    await queryRunner.query(`
            DROP TABLE "invoices"
        `);
  }
}
