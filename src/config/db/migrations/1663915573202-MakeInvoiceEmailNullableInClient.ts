import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeInvoiceEmailNullableInClient1663915573202 implements MigrationInterface {
  name = 'MakeInvoiceEmailNullableInClient1663915573202';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients"
            ALTER COLUMN "invoicingEmail" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients"
            ALTER COLUMN "invoicingEmail"
            SET NOT NULL
        `);
  }
}
