import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionPaymentTable1657800134950 implements MigrationInterface {
  name = 'CreateSubscriptionPaymentTable1657800134950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "subscription_payments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "status" character varying NOT NULL,
                "payment_date" TIMESTAMP NOT NULL,
                "amount" double precision NOT NULL,
                "company_id" uuid NOT NULL,
                CONSTRAINT "PK_1b7a76365fd477de59cba0ab957" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "subscription_payments_company_id_index" ON "subscription_payments" ("company_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription_payments"
            ADD CONSTRAINT "FK_eebfcdfc544379ebbf73bbb0bea" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "subscription_payments" DROP CONSTRAINT "FK_eebfcdfc544379ebbf73bbb0bea"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."subscription_payments_company_id_index"
        `);
    await queryRunner.query(`
            DROP TABLE "subscription_payments"
        `);
  }
}
