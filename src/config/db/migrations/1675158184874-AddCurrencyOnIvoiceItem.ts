import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrencyOnIvoiceItem1675158184874 implements MigrationInterface {
  name = 'AddCurrencyOnIvoiceItem1675158184874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoice_items"
            ADD "currency" character varying NOT NULL DEFAULT '$'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoice_items" DROP COLUMN "currency"
        `);
  }
}
