import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingIndexing1659165959176 implements MigrationInterface {
  name = 'AddMissingIndexing1659165959176';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE INDEX "user_email" ON "users" ("email")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_first_name" ON "users" ("first_name")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_last_name" ON "users" ("last_name")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_status" ON "users" ("status")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_type" ON "users" ("type")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_archived" ON "users" ("archived")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_company_id" ON "users" ("company_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "companies_admin_email" ON "companies" ("admin_email")
        `);
    await queryRunner.query(`
            CREATE INDEX "companies_subscription_id" ON "companies" ("subscription_id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."companies_subscription_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."companies_admin_email"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_company_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_archived"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_last_name"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_first_name"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_email"
        `);
  }
}
