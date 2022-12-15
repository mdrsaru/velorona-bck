import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollectionMethodInCompany1671080328100 implements MigrationInterface {
  name = 'AddCollectionMethodInCompany1671080328100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "collection_method" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "collection_method"
        `);
  }
}
