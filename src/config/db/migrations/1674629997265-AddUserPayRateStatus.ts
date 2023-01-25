import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPayRateStatus1674629997265 implements MigrationInterface {
  name = 'AddUserPayRateStatus1674629997265';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_payrate"
            ALTER COLUMN "status" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_payrate"
            ALTER COLUMN "status"
            SET NOT NULL
        `);
  }
}
