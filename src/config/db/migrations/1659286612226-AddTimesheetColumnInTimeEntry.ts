import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimesheetColumnInTimeEntry1659286612226 implements MigrationInterface {
  name = 'AddTimesheetColumnInTimeEntry1659286612226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "timesheet_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "FK_be0bc3d86f3b112aa21c3229d91" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP CONSTRAINT "FK_be0bc3d86f3b112aa21c3229d91"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "timesheet_id"
        `);
  }
}
