import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkscheduleDetailAndWorkscheduleTimeDetailTable1657514661206 implements MigrationInterface {
  name = 'CreateWorkscheduleDetailAndWorkscheduleTimeDetailTable1657514661206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "workschedule_time_details" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "start_time" TIME NOT NULL,
                "end_time" TIME NOT NULL,
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
            ALTER TABLE "workschedule_time_details"
            ADD CONSTRAINT "FK_d3e80953f29bb964a951ebd3d75" FOREIGN KEY ("workschedule_detail_id") REFERENCES "workschedule_details"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details" DROP CONSTRAINT "FK_d3e80953f29bb964a951ebd3d75"
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
