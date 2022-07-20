import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManagerColumnInUser1658140348075 implements MigrationInterface {
  name = 'AddManagerColumnInUser1658140348075';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "manager_id" uuid
        `);
    await queryRunner.query(`
            CREATE INDEX "user_manager_id" ON "users" ("manager_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_fba2d8e029689aa8fea98e53c91" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_fba2d8e029689aa8fea98e53c91"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_manager_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "manager_id"
        `);
  }
}
