import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyNameInDemoRequest1660121520865 implements MigrationInterface {
  name = 'AddCompanyNameInDemoRequest1660121520865';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "demo_requests"
            ADD "company_name" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "demo_requests" DROP COLUMN "company_name"
        `);
  }
}
