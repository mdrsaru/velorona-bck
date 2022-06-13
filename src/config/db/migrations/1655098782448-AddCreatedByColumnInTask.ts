import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByColumnInTask1655098782448 implements MigrationInterface {
  name = 'AddCreatedByColumnInTask1655098782448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD "created_by" uuid
        `);
    await queryRunner.query(`
            CREATE INDEX "task_created_by" ON "tasks" ("created_by")
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_9fc727aef9e222ebd09dc8dac08" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_9fc727aef9e222ebd09dc8dac08"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."task_created_by"
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks" DROP COLUMN "created_by"
        `);
  }
}
