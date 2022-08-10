import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUserProjectRelationTable1659958268690 implements MigrationInterface {
  name = 'MakeUserProjectRelationTable1659958268690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user_project" (
                "project_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_3af92ffa56a2ad082dad5407800" PRIMARY KEY ("project_id", "user_id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9f6abe80cbe92430eaa7a720c2" ON "user_project" ("project_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_dd66dc6a11849a786759c22553" ON "user_project" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project"
            ADD CONSTRAINT "FK_9f6abe80cbe92430eaa7a720c26" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project"
            ADD CONSTRAINT "FK_dd66dc6a11849a786759c225537" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_project" DROP CONSTRAINT "FK_dd66dc6a11849a786759c225537"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project" DROP CONSTRAINT "FK_9f6abe80cbe92430eaa7a720c26"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_dd66dc6a11849a786759c22553"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9f6abe80cbe92430eaa7a720c2"
        `);
    await queryRunner.query(`
            DROP TABLE "user_project"
        `);
  }
}
