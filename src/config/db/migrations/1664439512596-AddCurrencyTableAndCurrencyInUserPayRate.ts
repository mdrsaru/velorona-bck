import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCurrencyTableAndCurrencyInUserPayRate1664439512596 implements MigrationInterface {
  name = 'AddCurrencyTableAndCurrencyInUserPayRate1664439512596';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "currency" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "symbol" character varying(12) NOT NULL,
                CONSTRAINT "PK_3cda65c731a6264f0e444cc9b91" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate"
            ADD "user_rate_currency_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate"
            ADD "invoice_rate_currency_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate"
            ADD CONSTRAINT "FK_adbb493a2ea75dfb02b4155f2f9" FOREIGN KEY ("user_rate_currency_id") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate"
            ADD CONSTRAINT "FK_3deb09ba3c99f0ebf9c1045962c" FOREIGN KEY ("invoice_rate_currency_id") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_payrate" DROP CONSTRAINT "FK_3deb09ba3c99f0ebf9c1045962c"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate" DROP CONSTRAINT "FK_adbb493a2ea75dfb02b4155f2f9"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate" DROP COLUMN "invoice_rate_currency_id"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate" DROP COLUMN "user_rate_currency_id"
        `);
    await queryRunner.query(`
            DROP TABLE "currency"
        `);
  }
}
