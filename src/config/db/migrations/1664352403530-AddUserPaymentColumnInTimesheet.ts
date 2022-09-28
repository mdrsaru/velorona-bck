import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPaymentColumnInTimesheet1664352403530 implements MigrationInterface {
  name = 'AddUserPaymentColumnInTimesheet1664352403530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "timesheet"
            ADD "user_payment" double precision DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "timesheet" DROP COLUMN "user_payment"
        `);
  }
}
