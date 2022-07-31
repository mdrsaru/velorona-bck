import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttachmentTable1659287528264 implements MigrationInterface {
  name = 'CreateAttachmentTable1659287528264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "attachments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "description" character varying NOT NULL,
                "attachment_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                "created_by" uuid NOT NULL,
                "timesheet_id" uuid,
                "invoice_id" uuid,
                "status" character varying NOT NULL DEFAULT 'Pending',
                CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "Timesheet_company_id_index" ON "attachments" ("company_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "Timesheet_created_by_index" ON "attachments" ("created_by")
        `);
    await queryRunner.query(`
            CREATE INDEX "Timesheet_timesheet_id_index" ON "attachments" ("timesheet_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "Timesheet_invoice_id_index" ON "attachments" ("invoice_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments"
            ADD CONSTRAINT "FK_0f0c0f540cbf0f2e9499f9a082e" FOREIGN KEY ("attachment_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments"
            ADD CONSTRAINT "FK_5f524c6d182fef8777ce9ca8a4a" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments"
            ADD CONSTRAINT "FK_2d59febd2d8b3c772a11c35487e" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments"
            ADD CONSTRAINT "FK_51d21cd9bd18f4277df3ad452b6" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments"
            ADD CONSTRAINT "FK_c11fdc1ecb2589a723d2cba26d1" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "attachments" DROP CONSTRAINT "FK_c11fdc1ecb2589a723d2cba26d1"
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments" DROP CONSTRAINT "FK_51d21cd9bd18f4277df3ad452b6"
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments" DROP CONSTRAINT "FK_2d59febd2d8b3c772a11c35487e"
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments" DROP CONSTRAINT "FK_5f524c6d182fef8777ce9ca8a4a"
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments" DROP CONSTRAINT "FK_0f0c0f540cbf0f2e9499f9a082e"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."Timesheet_invoice_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."Timesheet_timesheet_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."Timesheet_created_by_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."Timesheet_company_id_index"
        `);
    await queryRunner.query(`
            DROP TABLE "attachments"
        `);
  }
}
