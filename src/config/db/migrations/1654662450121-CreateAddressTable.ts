import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAddressTable1654662450121 implements MigrationInterface {
  name = 'CreateAddressTable1654662450121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "addresses" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "street_address" character varying,
                "apt_or_suite" character varying,
                "city" character varying,
                "state" character varying,
                "zipcode" character varying,
                CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "addresses"
        `);
  }
}
