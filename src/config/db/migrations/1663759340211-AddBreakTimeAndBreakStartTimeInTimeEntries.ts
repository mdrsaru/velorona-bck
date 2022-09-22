import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBreakTimeAndBreakStartTimeInTimeEntries1663759340211 implements MigrationInterface {
  name = 'AddBreakTimeAndBreakStartTimeInTimeEntries1663759340211';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "start_break_time" TIMESTAMP
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "break_time" integer
        `);
    await queryRunner.query(`
            CREATE INDEX "time_entries_start_break_time_index" ON "time_entries" ("start_break_time")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."time_entries_start_break_time_index"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "break_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "start_break_time"
        `);
  }
}
