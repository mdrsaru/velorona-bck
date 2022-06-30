import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTimesheetAttachmentsTable1656567308486 implements MigrationInterface {
  name = 'CreateTimesheetAttachmentsTable1656567308486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "timesheet_attachments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "description" character varying NOT NULL,
                "attachment_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                "created_by" uuid NOT NULL,
                "timesheet_id" uuid NOT NULL,
                CONSTRAINT "PK_217b671b5f97a969b766c9cc8f8" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "Timesheet_company_id_index" ON "timesheet_attachments" ("company_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "Timesheet_created_by_index" ON "timesheet_attachments" ("created_by")
        `);
    await queryRunner.query(`
            CREATE INDEX "Timesheet_timesheet_id_index" ON "timesheet_attachments" ("timesheet_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ADD CONSTRAINT "FK_623943e260f043b9a77d08bf460" FOREIGN KEY ("attachment_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ADD CONSTRAINT "FK_a13e619c9054b9ab3455b3d1dd0" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ADD CONSTRAINT "FK_c82d95bcfef22740870a1f9f486" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments"
            ADD CONSTRAINT "FK_b00bb261e9f3f7acbc0296df620" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments" DROP CONSTRAINT "FK_b00bb261e9f3f7acbc0296df620"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments" DROP CONSTRAINT "FK_c82d95bcfef22740870a1f9f486"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments" DROP CONSTRAINT "FK_a13e619c9054b9ab3455b3d1dd0"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_attachments" DROP CONSTRAINT "FK_623943e260f043b9a77d08bf460"
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
            DROP TABLE "timesheet_attachments"
        `);
  }
}
