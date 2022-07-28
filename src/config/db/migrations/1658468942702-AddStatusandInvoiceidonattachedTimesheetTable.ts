import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusandInvoiceidonattachedTimesheetTable1658468942702 implements MigrationInterface {
  name = 'AddStatusandInvoiceidonattachedTimesheetTable1658468942702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ADD "invoice_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ADD "status" character varying NOT NULL DEFAULT 'Pending'
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ALTER COLUMN "duration"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments" DROP CONSTRAINT "FK_b00bb261e9f3f7acbc0296df620"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ALTER COLUMN "timesheet_id" DROP NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "Timesheet_invoice_id_index" ON "timesheet_attachments" ("invoice_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ADD CONSTRAINT "FK_b00bb261e9f3f7acbc0296df620" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ADD CONSTRAINT "FK_f08779cc16abb3302717ff82692" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments" DROP CONSTRAINT "FK_f08779cc16abb3302717ff82692"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments" DROP CONSTRAINT "FK_b00bb261e9f3f7acbc0296df620"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."Timesheet_invoice_id_index"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ALTER COLUMN "timesheet_id"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ADD CONSTRAINT "FK_b00bb261e9f3f7acbc0296df620" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ALTER COLUMN "duration" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments" DROP COLUMN "invoice_id"
        `);
  }
}
