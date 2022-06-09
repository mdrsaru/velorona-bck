import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTimesheetTable1654664833978 implements MigrationInterface {
  name = 'CreateTimesheetTable1654664833978';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "timesheet" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "week_start_date" date NOT NULL,
                "week_end_date" date,
                "duration" integer,
                "total_expense" double precision,
                "status" character varying NOT NULL DEFAULT 'Pending',
                "company_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "client_id" uuid NOT NULL,
                "approver_id" uuid,
                "last_approved_at" TIMESTAMP,
                "last_submitted_at" TIMESTAMP,
                "is_submitted" boolean NOT NULL DEFAULT false,
                CONSTRAINT "unique_user_timesheet" UNIQUE (
                    "user_id",
                    "client_id",
                    "week_start_date",
                    "week_end_date"
                ),
                CONSTRAINT "PK_53c30fa094ae81f166955fb1036" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "timesheet_week_start_date_index" ON "timesheet" ("week_start_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "timesheet_week_end_date_index" ON "timesheet" ("week_end_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "timesheet_company_id_index" ON "timesheet" ("company_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "timesheet_user_id_index" ON "timesheet" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "timesheet_client_id_index" ON "timesheet" ("client_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet"
            ADD CONSTRAINT "FK_803fe887605aa8ba97af4c9a7e5" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet"
            ADD CONSTRAINT "FK_f1982fcf8ecb489419062b10d45" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet"
            ADD CONSTRAINT "FK_d3dc30308683c53ff240e6aca7b" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet"
            ADD CONSTRAINT "FK_d402c922afae99d7ea3a5732fd4" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "timesheet" DROP CONSTRAINT "FK_d402c922afae99d7ea3a5732fd4"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet" DROP CONSTRAINT "FK_d3dc30308683c53ff240e6aca7b"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet" DROP CONSTRAINT "FK_f1982fcf8ecb489419062b10d45"
        `);
    await queryRunner.query(`
            ALTER TABLE "timesheet" DROP CONSTRAINT "FK_803fe887605aa8ba97af4c9a7e5"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."timesheet_client_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."timesheet_user_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."timesheet_company_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."timesheet_week_end_date_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."timesheet_week_start_date_index"
        `);
    await queryRunner.query(`
            DROP TABLE "timesheet"
        `);
  }
}
