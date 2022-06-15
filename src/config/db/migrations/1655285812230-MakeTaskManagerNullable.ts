import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTaskManagerNullable1655285812230 implements MigrationInterface {
  name = 'MakeTaskManagerNullable1655285812230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."task_manager_id"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE INDEX "task_manager_id" ON "tasks" ("manager_id")
        `);
  }
}
