import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttachedTimesheetTable1656402845512 implements MigrationInterface {
  name = 'CreateAttachedTimesheetTable1656402845512';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "attached_timesheets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "date" TIMESTAMP NOT NULL,
                "total_cost" integer NOT NULL,
                "description" character varying,
                "attachment_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                CONSTRAINT "PK_48c6ecd639360aebc642b280fc2" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "AttachedTimesheet_date_index" ON "attached_timesheets" ("date")
        `);
    await queryRunner.query(`
            CREATE INDEX "AttachedTimesheet_company_id_index" ON "attached_timesheets" ("company_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "attached_timesheets"
            ADD CONSTRAINT "FK_c63424da565f4dc8e2b7efd4bfc" FOREIGN KEY ("attachment_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "attached_timesheets"
            ADD CONSTRAINT "FK_a235cd6f20265fd7547485fbb15" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "attached_timesheets" DROP CONSTRAINT "FK_a235cd6f20265fd7547485fbb15"
        `);
    await queryRunner.query(`
            ALTER TABLE "attached_timesheets" DROP CONSTRAINT "FK_c63424da565f4dc8e2b7efd4bfc"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."AttachedTimesheet_company_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."AttachedTimesheet_date_index"
        `);
    await queryRunner.query(`
            DROP TABLE "attached_timesheets"
        `);
  }
}
