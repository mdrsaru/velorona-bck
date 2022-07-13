import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkscheduleTable1657682270706 implements MigrationInterface {
  name = 'CreateWorkscheduleTable1657682270706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP CONSTRAINT "FK_759fecd19b16b63ee672e05f3bf"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP CONSTRAINT "FK_4949068832a1e60dfce5529ac89"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "from"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "task_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "to"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "start_date" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "end_date" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "payroll_allocated_hours" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "payroll_usuage_hours" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "status" character varying NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_start_date" ON "workschedule" ("start_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_end_date" ON "workschedule" ("end_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_status" ON "workschedule" ("status")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_end_date"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_start_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "payroll_usuage_hours"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "payroll_allocated_hours"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "end_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP COLUMN "start_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "user_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "to" integer NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "date" TIMESTAMP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "task_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD "from" integer NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD CONSTRAINT "FK_4949068832a1e60dfce5529ac89" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD CONSTRAINT "FK_759fecd19b16b63ee672e05f3bf" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
