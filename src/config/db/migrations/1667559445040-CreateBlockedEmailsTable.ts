import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlockedEmailsTable1667559445040 implements MigrationInterface {
  name = 'CreateBlockedEmailsTable1667559445040';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "blocked_emails" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "email" character varying NOT NULL,
                CONSTRAINT "UQ_ee2df46c552454a6453de4943be" UNIQUE ("email"),
                CONSTRAINT "PK_59bb05e923ca6ca5915a98c4eaf" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "blocked_emails_email" ON "blocked_emails" ("email")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."blocked_emails_email"
        `);
    await queryRunner.query(`
            DROP TABLE "blocked_emails"
        `);
  }
}
