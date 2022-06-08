import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyMediaRelation1654663235313 implements MigrationInterface {
  name = 'CompanyMediaRelation1654663235313';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD "logo_id" uuid
        `);
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD CONSTRAINT "UQ_762447c46ea5c7b1602ace3144e" UNIQUE ("logo_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "companies"
            ADD CONSTRAINT "FK_762447c46ea5c7b1602ace3144e" FOREIGN KEY ("logo_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "companies" DROP CONSTRAINT "FK_762447c46ea5c7b1602ace3144e"
        `);
    await queryRunner.query(`
            ALTER TABLE "companies" DROP CONSTRAINT "UQ_762447c46ea5c7b1602ace3144e"
        `);
    await queryRunner.query(`
            ALTER TABLE "companies" DROP COLUMN "logo_id"
        `);
  }
}
