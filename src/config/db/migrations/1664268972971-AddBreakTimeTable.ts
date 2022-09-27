import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBreakTimeTable1664268972971 implements MigrationInterface {
  name = 'AddBreakTimeTable1664268972971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."time_entries_start_break_time_index"
        `);
    await queryRunner.query(`
            CREATE TABLE "break_times" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "start_time" TIMESTAMP,
                "end_time" TIMESTAMP,
                "duration" integer,
                "time_entry_id" uuid,
                CONSTRAINT "PK_f4b8e58b1fac1033ab2d83d6fa3" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "start_break_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "break_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "break_duration" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "break_times"
            ADD CONSTRAINT "FK_d62718caf2862d1d380ede31248" FOREIGN KEY ("time_entry_id") REFERENCES "time_entries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "break_times" DROP CONSTRAINT "FK_d62718caf2862d1d380ede31248"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "break_duration"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "break_time" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "start_break_time" TIMESTAMP
        `);
    await queryRunner.query(`
            DROP TABLE "break_times"
        `);
    await queryRunner.query(`
            CREATE INDEX "time_entries_start_break_time_index" ON "time_entries" ("start_break_time")
        `);
  }
}
