import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkscheduleTable1657518348177 implements MigrationInterface {
  name = 'CreateWorkscheduleTable1657518348177';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "workschedule" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "start_date" TIMESTAMP NOT NULL,
                "end_date" TIMESTAMP NOT NULL,
                "payroll_allocated_hours" integer,
                "payroll_usuage_hours" integer,
                "status" character varying NOT NULL,
                "company_id" uuid NOT NULL,
                CONSTRAINT "PK_9426343bfdf21a4ad10bc0bc007" PRIMARY KEY ("id")
            )
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
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD CONSTRAINT "FK_1d910b3d6cc149e988b4542ad1a" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP CONSTRAINT "FK_1d910b3d6cc149e988b4542ad1a"
        `);
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
            DROP TABLE "workschedule"
        `);
  }
}
