import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskTable1654664717473 implements MigrationInterface {
  name = 'CreateTaskTable1654664717473';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "description" character varying,
                "status" character varying DEFAULT 'UnScheduled',
                "active" boolean NOT NULL DEFAULT true,
                "archived" boolean NOT NULL DEFAULT false,
                "priority " boolean NOT NULL DEFAULT false,
                "deadline" TIMESTAMP,
                "manager_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                "project_id" uuid NOT NULL,
                CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "task_status_index" ON "tasks" ("status")
        `);
    await queryRunner.query(`
            CREATE INDEX "task_active_index" ON "tasks" ("active")
        `);
    await queryRunner.query(`
            CREATE TABLE "task_assignment" (
                "task_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_f824225a835e8a11a1a73e2a165" PRIMARY KEY ("task_id", "user_id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_5f8544ee8cfca009e58e0e52d8" ON "task_assignment" ("task_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_579d61b631951292a9f51f6727" ON "task_assignment" ("user_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "task_attachments" (
                "task_id" uuid NOT NULL,
                "media_id" uuid NOT NULL,
                CONSTRAINT "PK_2d247618d6d67c0349f38f186b8" PRIMARY KEY ("task_id", "media_id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_8c07320adec50a39744a4a301d" ON "task_attachments" ("task_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_998a7cf3db0fb48f61f5961fd9" ON "task_attachments" ("media_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_2f08f1ccbb1f500bfb2f863bcce" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_53fbfb9d05347278ea35ccb3aca" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "task_assignment"
            ADD CONSTRAINT "FK_5f8544ee8cfca009e58e0e52d89" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "task_assignment"
            ADD CONSTRAINT "FK_579d61b631951292a9f51f67272" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "task_attachments"
            ADD CONSTRAINT "FK_8c07320adec50a39744a4a301d3" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "task_attachments"
            ADD CONSTRAINT "FK_998a7cf3db0fb48f61f5961fd93" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_998a7cf3db0fb48f61f5961fd93"
        `);
    await queryRunner.query(`
            ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_8c07320adec50a39744a4a301d3"
        `);
    await queryRunner.query(`
            ALTER TABLE "task_assignment" DROP CONSTRAINT "FK_579d61b631951292a9f51f67272"
        `);
    await queryRunner.query(`
            ALTER TABLE "task_assignment" DROP CONSTRAINT "FK_5f8544ee8cfca009e58e0e52d89"
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_9eecdb5b1ed8c7c2a1b392c28d4"
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_53fbfb9d05347278ea35ccb3aca"
        `);
    await queryRunner.query(`
            ALTER TABLE "tasks" DROP CONSTRAINT "FK_2f08f1ccbb1f500bfb2f863bcce"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_998a7cf3db0fb48f61f5961fd9"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_8c07320adec50a39744a4a301d"
        `);
    await queryRunner.query(`
            DROP TABLE "task_attachments"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_579d61b631951292a9f51f6727"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_5f8544ee8cfca009e58e0e52d8"
        `);
    await queryRunner.query(`
            DROP TABLE "task_assignment"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."task_active_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."task_status_index"
        `);
    await queryRunner.query(`
            DROP TABLE "tasks"
        `);
  }
}
