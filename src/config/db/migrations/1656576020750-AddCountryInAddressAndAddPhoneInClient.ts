import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountryInAddressAndAddPhoneInClient1656576020750 implements MigrationInterface {
  name = 'AddCountryInAddressAndAddPhoneInClient1656576020750';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "addresses"
            ADD "country" character varying(70)
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "phone" character varying
        `);
    await queryRunner.query(`
            CREATE INDEX "address_country" ON "addresses" ("country")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."address_country"
        `);
    await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "phone"
        `);
    await queryRunner.query(`
            ALTER TABLE "addresses" DROP COLUMN "country"
        `);
  }
}
