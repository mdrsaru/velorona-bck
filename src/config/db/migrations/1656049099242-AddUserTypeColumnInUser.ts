import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTypeColumnInUser1656049099242 implements MigrationInterface {
  name = 'AddUserTypeColumnInUser1656049099242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "type" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_2f08f1ccbb1f500bfb2f863bcce"
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks"
            ALTER COLUMN "manager_id" DROP NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX "task_manager_id" ON "tasks" ("manager_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_2f08f1ccbb1f500bfb2f863bcce" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_2f08f1ccbb1f500bfb2f863bcce"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."task_manager_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks"
            ALTER COLUMN "manager_id"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_2f08f1ccbb1f500bfb2f863bcce" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "type"
        `);
  }
}
