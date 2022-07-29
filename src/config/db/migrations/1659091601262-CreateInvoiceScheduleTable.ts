import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoiceScheduleTable1659091601262 implements MigrationInterface {
  name = 'CreateInvoiceScheduleTable1659091601262';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "invoice_schedule" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "schedule_date" date NOT NULL,
                "timesheet_id" uuid NOT NULL,
                CONSTRAINT "UQ_a8921ff06c81394633c79ecd7a5" UNIQUE ("timesheet_id"),
                CONSTRAINT "PK_982df12ca2749b67ad8a2086087" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "invoice_schedule_schedule_date" ON "invoice_schedule" ("schedule_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "invoice_schedule_timesheet_id" ON "invoice_schedule" ("timesheet_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice_schedule"
            ADD CONSTRAINT "FK_a8921ff06c81394633c79ecd7a5" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoice_schedule" DROP CONSTRAINT "FK_a8921ff06c81394633c79ecd7a5"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."invoice_schedule_timesheet_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."invoice_schedule_schedule_date"
        `);
    await queryRunner.query(`
            DROP TABLE "invoice_schedule"
        `);
  }
}
