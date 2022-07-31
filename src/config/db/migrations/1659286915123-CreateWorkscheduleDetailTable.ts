import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkscheduleDetailTable1659286915123 implements MigrationInterface {
  name = 'CreateWorkscheduleDetailTable1659286915123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "workschedule_details" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "schedule_date" TIMESTAMP NOT NULL,
                "duration" integer NOT NULL,
                "workschedule_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_8c1c81540e2d1f8815ff08762ec" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "workschedule_date" ON "workschedule_details" ("schedule_date")
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ADD CONSTRAINT "FK_595c4788627be7460319691f495" FOREIGN KEY ("workschedule_id") REFERENCES "workschedule"("id") ON DELETE CASCADE ON UPDATE CASCADE
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
            DROP INDEX "public"."workschedule_date"
        `);
    await queryRunner.query(`
            DROP TABLE "workschedule_details"
        `);
  }
}
