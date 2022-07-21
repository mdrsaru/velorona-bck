import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimesheetCommentTable1658330256260 implements MigrationInterface {
  name = 'AddTimesheetCommentTable1658330256260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "timesheet_comments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "comment" character varying NOT NULL,
                "user_id" uuid NOT NULL,
                "timesheet_id" uuid NOT NULL,
                "reply_id" uuid,
                CONSTRAINT "PK_795e603a8cf0e3dcf6dc18361d4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "timesheet_comments_user_id" ON "timesheet_comments" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "timesheet_comments_timesheet_id" ON "timesheet_comments" ("timesheet_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "timesheet_comments_reply_id" ON "timesheet_comments" ("reply_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_comments"
            ADD CONSTRAINT "FK_5e22a5f6bf3b8ae79cc026d432b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_comments"
            ADD CONSTRAINT "FK_a24332a77efb96cfb810f89d28c" FOREIGN KEY ("timesheet_id") REFERENCES "timesheet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_comments"
            ADD CONSTRAINT "FK_5b43c9af3541a051ecf69036126" FOREIGN KEY ("reply_id") REFERENCES "timesheet_comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "timesheet_comments" DROP CONSTRAINT "FK_5b43c9af3541a051ecf69036126"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_comments" DROP CONSTRAINT "FK_a24332a77efb96cfb810f89d28c"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet_comments" DROP CONSTRAINT "FK_5e22a5f6bf3b8ae79cc026d432b"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."timesheet_comments_reply_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."timesheet_comments_timesheet_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."timesheet_comments_user_id"
        `);
    await queryRunner.query(`
            DROP TABLE "timesheet_comments"
        `);
  }
}
