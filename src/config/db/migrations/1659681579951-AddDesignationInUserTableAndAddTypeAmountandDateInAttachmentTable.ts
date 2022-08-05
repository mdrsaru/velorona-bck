import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDesignationInUserTableAndAddTypeAmountandDateInAttachmentTable1659681579951
  implements MigrationInterface
{
  name = 'AddDesignationInUserTableAndAddTypeAmountandDateInAttachmentTable1659681579951';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "designation" character varying(25)
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments"
            ADD "type" character varying DEFAULT 'Timesheet'
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments"
            ADD "amount" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments"
            ADD "date" TIMESTAMP
        `);
    await queryRunner.query(`
            CREATE INDEX "user_designation" ON "users" ("designation")
        `);
    await queryRunner.query(`
            CREATE INDEX "Timesheet_type" ON "attachments" ("type")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."Timesheet_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_designation"
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments" DROP COLUMN "date"
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments" DROP COLUMN "amount"
        `);
    await queryRunner.query(`
            ALTER TABLE "attachments" DROP COLUMN "type"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "designation"
        `);
  }
}
