import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWorkScheduleTable1654665659546 implements MigrationInterface {
  name = 'CreateWorkScheduleTable1654665659546';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "workschedule" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "date" TIMESTAMP NOT NULL,
                "from" integer NOT NULL,
                "to" integer NOT NULL,
                "task_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                CONSTRAINT "PK_9426343bfdf21a4ad10bc0bc007" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD CONSTRAINT "FK_759fecd19b16b63ee672e05f3bf" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule"
            ADD CONSTRAINT "FK_4949068832a1e60dfce5529ac89" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "workschedule" DROP CONSTRAINT "FK_4949068832a1e60dfce5529ac89"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule" DROP CONSTRAINT "FK_759fecd19b16b63ee672e05f3bf"
        `);
    await queryRunner.query(`
            DROP TABLE "workschedule"
        `);
  }
}
