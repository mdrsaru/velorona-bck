import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddloggedInFlagInUser1660822117355 implements MigrationInterface {
  name = 'AddloggedInFlagInUser1660822117355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "logged_in" boolean NOT NULL DEFAULT false
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "status"
            SET DEFAULT 'Invitation Sent'
        `);
    await queryRunner.query(`
            CREATE INDEX "user_loggedIn" ON "users" ("logged_in")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."user_loggedIn"
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "status"
            SET DEFAULT 'Active'
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "logged_in"
        `);
  }
}
