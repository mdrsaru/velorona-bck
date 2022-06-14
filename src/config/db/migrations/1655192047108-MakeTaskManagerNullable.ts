import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTaskManagerNullable1655192047108 implements MigrationInterface {
  name = 'MakeTaskManagerNullable1655192047108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE INDEX "task_manager_id" ON "tasks" ("manager_id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."task_manager_id"
        `);
  }
}
