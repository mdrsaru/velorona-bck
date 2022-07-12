import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropTaskColumns1657012543832 implements MigrationInterface {
  name = 'DropTaskColumns1657012543832';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP CONSTRAINT "FK_104aa11ede7c8d5afbbe1fdbb24"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."time_entries_task_id_index"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "task_id"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "task_id" uuid NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "time_entries_task_id_index" ON "time_entries" ("task_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "FK_104aa11ede7c8d5afbbe1fdbb24" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
