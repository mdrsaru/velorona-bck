import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDurationInWorkscheduleDetailTable1657875469172 implements MigrationInterface {
  name = 'AddDurationInWorkscheduleDetailTable1657875469172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details" DROP COLUMN "date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ADD "schedule_date" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ADD "duration" integer
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_date" ON "workschedule_details" ("schedule_date")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details" DROP COLUMN "duration"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details" DROP COLUMN "schedule_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ADD "date" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_date" ON "workschedule_details" ("date")
        `);
  }
}
