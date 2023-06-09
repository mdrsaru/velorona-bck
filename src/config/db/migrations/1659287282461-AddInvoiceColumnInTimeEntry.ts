import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceColumnInTimeEntry1659287282461 implements MigrationInterface {
  name = 'AddInvoiceColumnInTimeEntry1659287282461';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "invoice_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "FK_8776158e9ef020ce7b066dd20eb" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP CONSTRAINT "FK_8776158e9ef020ce7b066dd20eb"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "invoice_id"
        `);
  }
}
