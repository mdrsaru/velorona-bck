import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeEntryHourlyRateAndTimesheetInvoicedDuration1654771905916 implements MigrationInterface {
  name = 'TimeEntryHourlyRateAndTimesheetInvoicedDuration1654771905916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "timesheet"
            ADD "invoiced_duration" integer DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "hourly_rate" double precision NOT NULL DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "hourly_rate"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet" DROP COLUMN "invoiced_duration"
        `);
  }
}
