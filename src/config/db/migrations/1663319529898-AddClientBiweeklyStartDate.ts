import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientBiweeklyStartDate1663319529898 implements MigrationInterface {
  name = 'AddClientBiweeklyStartDate1663319529898';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD "biweekly_start_date" date
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients" DROP COLUMN "biweekly_start_date"
        `);
  }
}
