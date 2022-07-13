import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkscheduleDetailAndWorkscheduleTimeDetailTable1657682989115 implements MigrationInterface {
  name = 'CreateWorkscheduleDetailAndWorkscheduleTimeDetailTable1657682989115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "workschedule_time_details" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "start_time" TIMESTAMP NOT NULL,
                "end_time" TIMESTAMP NOT NULL,
                "duration" integer NOT NULL,
                "workschedule_detail_id" uuid NOT NULL,
                CONSTRAINT "PK_12b8b9796ce048f295d8b076213" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "workscheduleTimeDetail_start_time" ON "workschedule_time_details" ("start_time")
        `);
    await queryRunner.query(`
            CREATE INDEX "workscheduleTimeDetail_end_date" ON "workschedule_time_details" ("end_time")
        `);
    await queryRunner.query(`
            CREATE INDEX "workscheduleTimeDetail_workschedule_detail" ON "workschedule_time_details" ("workschedule_detail_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "workschedule_details" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "date" TIMESTAMP NOT NULL,
                "workschedule_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_8c1c81540e2d1f8815ff08762ec" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_date" ON "workschedule_details" ("date")
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details"
            ADD CONSTRAINT "FK_d3e80953f29bb964a951ebd3d75" FOREIGN KEY ("workschedule_detail_id") REFERENCES "workschedule_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ADD CONSTRAINT "FK_595c4788627be7460319691f495" FOREIGN KEY ("workschedule_id") REFERENCES "workschedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ADD CONSTRAINT "FK_bc7705e6c6a6dea6b04c1644705" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "workschedule_details" DROP CONSTRAINT "FK_bc7705e6c6a6dea6b04c1644705"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details" DROP CONSTRAINT "FK_595c4788627be7460319691f495"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details" DROP CONSTRAINT "FK_d3e80953f29bb964a951ebd3d75"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workschedule_date"
        `);
    await queryRunner.query(`
            DROP TABLE "workschedule_details"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workscheduleTimeDetail_workschedule_detail"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workscheduleTimeDetail_end_date"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."workscheduleTimeDetail_start_time"
        `);
    await queryRunner.query(`
            DROP TABLE "workschedule_time_details"
        `);
  }
}
