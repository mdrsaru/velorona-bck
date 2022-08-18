import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDiscountShippingColumnInvoice1660818598029 implements MigrationInterface {
  name = 'AddDiscountShippingColumnInvoice1660818598029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD "discount" double precision DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD "shipping" double precision DEFAULT '0'
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices"
            ADD "need_project" boolean NOT NULL DEFAULT true
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_0f0a8ef3c1f06792eee6d36232e"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice_items"
            ALTER COLUMN "project_id" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice_items"
            ADD CONSTRAINT "FK_0f0a8ef3c1f06792eee6d36232e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_0f0a8ef3c1f06792eee6d36232e"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice_items"
            ALTER COLUMN "project_id"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice_items"
            ADD CONSTRAINT "FK_0f0a8ef3c1f06792eee6d36232e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP COLUMN "need_project"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP COLUMN "shipping"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoices" DROP COLUMN "discount"
        `);
  }
}
