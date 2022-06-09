import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTimeEntryTable1654664936887 implements MigrationInterface {
  name = 'CreateTimeEntryTable1654664936887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "time_entries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "start_time" TIMESTAMP NOT NULL,
                "end_time" TIMESTAMP,
                "duration" integer,
                "client_location" character varying,
                "project_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                "created_by" uuid NOT NULL,
                "task_id" uuid NOT NULL,
                "approval_status" character varying NOT NULL DEFAULT 'Pending',
                "submitted" boolean NOT NULL DEFAULT false,
                "approver_id" uuid,
                "timesheet_id" uuid,
                CONSTRAINT "PK_b8bc5f10269ba2fe88708904aa0" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "time_entries_start_time_index" ON "time_entries" ("start_time")
        `);
    await queryRunner.query(`
            CREATE INDEX "time_entries_end_time_index" ON "time_entries" ("end_time")
        `);
    await queryRunner.query(`
            CREATE INDEX "time_entries_project_id_index" ON "time_entries" ("project_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "time_entries_company_id_index" ON "time_entries" ("company_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "time_entries_created_by_index" ON "time_entries" ("created_by")
        `);
    await queryRunner.query(`
            CREATE INDEX "time_entries_task_id_index" ON "time_entries" ("task_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "FK_6fe2f6f6ff6ee8f772cda32025b" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "FK_cd2c12c9a45c8bd116caaaf94bf" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "FK_5947ab36ca776a3f7c8920f2d70" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "FK_104aa11ede7c8d5afbbe1fdbb24" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "FK_f0202fd18326898067386476342" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "FK_be0bc3d86f3b112aa21c3229d91" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP CONSTRAINT "FK_be0bc3d86f3b112aa21c3229d91"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP CONSTRAINT "FK_f0202fd18326898067386476342"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP CONSTRAINT "FK_104aa11ede7c8d5afbbe1fdbb24"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP CONSTRAINT "FK_5947ab36ca776a3f7c8920f2d70"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP CONSTRAINT "FK_cd2c12c9a45c8bd116caaaf94bf"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP CONSTRAINT "FK_6fe2f6f6ff6ee8f772cda32025b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."time_entries_task_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."time_entries_created_by_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."time_entries_company_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."time_entries_project_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."time_entries_end_time_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."time_entries_start_time_index"
        `);
    await queryRunner.query(`
            DROP TABLE "time_entries"
        `);
  }
}
