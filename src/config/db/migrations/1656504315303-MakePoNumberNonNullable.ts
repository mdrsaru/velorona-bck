import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePoNumberNonNullable1656504315303 implements MigrationInterface {
  name = 'MakePoNumberNonNullable1656504315303';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ALTER COLUMN "po_number" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ALTER COLUMN "po_number"
            SET NOT NULL
        `);
  }
}
