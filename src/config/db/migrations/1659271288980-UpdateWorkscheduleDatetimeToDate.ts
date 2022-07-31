import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWorkscheduleDatetimeToDate1659271288980 implements MigrationInterface {
  name = 'UpdateWorkscheduleDatetimeToDate1659271288980';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_start_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "start_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "start_date" date NOT NULL
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_end_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "end_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "end_date" date NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_start_date" ON "workschedule" ("start_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_end_date" ON "workschedule" ("end_date")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_end_date"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_start_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "end_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "end_date" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_end_date" ON "workschedule" ("end_date")
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "start_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "start_date" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_start_date" ON "workschedule" ("start_date")
        `);
  }
}
