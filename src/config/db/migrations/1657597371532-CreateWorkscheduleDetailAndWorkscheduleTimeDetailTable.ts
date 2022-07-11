import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkscheduleDetailAndWorkscheduleTimeDetailTable1657597371532 implements MigrationInterface {
  name = 'CreateWorkscheduleDetailAndWorkscheduleTimeDetailTable1657597371532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."workscheduleTimeDetail_start_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details" DROP COLUMN "start_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details"
            ADD "start_time" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workscheduleTimeDetail_end_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details" DROP COLUMN "end_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details"
            ADD "end_time" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "workscheduleTimeDetail_start_time" ON "workschedule_time_details" ("start_time")
        `);
    await queryRunner.query(`
            CREATE INDEX "workscheduleTimeDetail_end_date" ON "workschedule_time_details" ("end_time")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."workscheduleTimeDetail_end_date"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workscheduleTimeDetail_start_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details" DROP COLUMN "end_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details"
            ADD "end_time" TIME NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "workscheduleTimeDetail_end_date" ON "workschedule_time_details" ("end_time")
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details" DROP COLUMN "start_time"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details"
            ADD "start_time" TIME NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "workscheduleTimeDetail_start_time" ON "workschedule_time_details" ("start_time")
        `);
  }
}
