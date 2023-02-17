import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusInUserProjectTable1676622397260 implements MigrationInterface {
  name = 'AddStatusInUserProjectTable1676622397260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_project" DROP CONSTRAINT "FK_dd66dc6a11849a786759c225537"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project" DROP CONSTRAINT "FK_9f6abe80cbe92430eaa7a720c26"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9f6abe80cbe92430eaa7a720c2"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_dd66dc6a11849a786759c22553"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project"
            ADD "status" character varying NOT NULL DEFAULT 'Inactive'
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project"
            ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project"
            ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9f6abe80cbe92430eaa7a720c2" ON "user_project" ("project_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_dd66dc6a11849a786759c22553" ON "user_project" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project"
            ADD CONSTRAINT "FK_dd66dc6a11849a786759c225537" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project"
            ADD CONSTRAINT "FK_9f6abe80cbe92430eaa7a720c26" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_project" DROP CONSTRAINT "FK_9f6abe80cbe92430eaa7a720c26"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project" DROP CONSTRAINT "FK_dd66dc6a11849a786759c225537"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_dd66dc6a11849a786759c22553"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9f6abe80cbe92430eaa7a720c2"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project" DROP COLUMN "updated_at"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project" DROP COLUMN "created_at"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_project" DROP COLUMN "status"
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_dd66dc6a11849a786759c22553" ON "user_project" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9f6abe80cbe92430eaa7a720c2" ON "user_project" ("project_id")
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
}
