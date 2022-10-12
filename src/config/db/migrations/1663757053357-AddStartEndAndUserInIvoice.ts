import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStartEndAndUserInIvoice1663757053357 implements MigrationInterface {
  name = 'AddStartEndAndUserInIvoice1663757053357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD "start_date" date
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD "end_date" date
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD "user_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP COLUMN "user_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP COLUMN "end_date"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP COLUMN "start_date"
        `);
  }
}
