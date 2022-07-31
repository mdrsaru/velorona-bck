import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivityLogTable1659287687158 implements MigrationInterface {
  name = 'CreateActivityLogTable1659287687158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "activity_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "message" character varying,
                "type" character varying,
                "user_id" uuid NOT NULL,
                "company_id" uuid NOT NULL,
                CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "activity_log_user_id_index" ON "activity_log" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "activity_log_company_id_index" ON "activity_log" ("company_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "activity_log"
            ADD CONSTRAINT "FK_81615294532ca4b6c70abd1b2e6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "activity_log"
            ADD CONSTRAINT "FK_4da92f37c4b5a98e84dbce46d64" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "activity_log" DROP CONSTRAINT "FK_4da92f37c4b5a98e84dbce46d64"
        `);
    await queryRunner.query(`
            ALTER TABLE "activity_log" DROP CONSTRAINT "FK_81615294532ca4b6c70abd1b2e6"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."activity_log_company_id_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."activity_log_user_id_index"
        `);
    await queryRunner.query(`
            DROP TABLE "activity_log"
        `);
  }
}
