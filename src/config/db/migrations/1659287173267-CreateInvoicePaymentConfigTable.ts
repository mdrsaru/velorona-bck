import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoicePaymentConfigTable1659287173267 implements MigrationInterface {
  name = 'CreateInvoicePaymentConfigTable1659287173267';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "invoice_payment_config" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "days" integer NOT NULL,
                CONSTRAINT "PK_88ef77b3ab3571ec38d0ad99845" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "invoice_payment_config_days" ON "invoice_payment_config" ("days")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."invoice_payment_config_days"
        `);
    await queryRunner.query(`
            DROP TABLE "invoice_payment_config"
        `);
  }
}
