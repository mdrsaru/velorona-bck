import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPayrateStatus1674647698961 implements MigrationInterface {
  name = 'AddUserPayrateStatus1674647698961';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_payrate"
            ADD "status" character varying DEFAULT 'Active'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_payrate" DROP COLUMN "status"
        `);
  }
}
