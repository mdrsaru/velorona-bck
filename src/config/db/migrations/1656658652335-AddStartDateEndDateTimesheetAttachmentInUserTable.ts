import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStartDateEndDateTimesheetAttachmentInUserTable1656658652335 implements MigrationInterface {
  name = 'AddStartDateEndDateTimesheetAttachmentInUserTable1656658652335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "start_date" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "end_date" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "timesheet_attachment" boolean DEFAULT false
        `);
    await queryRunner.query(`
            CREATE INDEX "user_start_date_index" ON "users" ("start_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_end_date_index" ON "users" ("end_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_timesheet_attachment_index" ON "users" ("timesheet_attachment")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."user_timesheet_attachment_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_end_date_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_start_date_index"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "timesheet_attachment"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "end_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "start_date"
        `);
  }
}
