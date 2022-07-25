import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceFieldColumnsToClient1658726924994 implements MigrationInterface {
  name = 'AddInvoiceFieldColumnsToClient1658726924994';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "invoice_schedule" character varying
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "invoice_payment_config_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ALTER COLUMN "duration"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "FK_d34f36e4131811317bba4cebcc6" FOREIGN KEY ("invoice_payment_config_id") REFERENCES "invoice_payment_config"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients" DROP CONSTRAINT "FK_d34f36e4131811317bba4cebcc6"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ALTER COLUMN "duration" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "invoice_payment_config_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "invoice_schedule"
        `);
  }
}
