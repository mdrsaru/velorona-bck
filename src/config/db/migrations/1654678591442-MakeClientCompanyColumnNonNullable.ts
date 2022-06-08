import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeClientCompanyColumnNonNullable1654678591442 implements MigrationInterface {
  name = 'MakeClientCompanyColumnNonNullable1654678591442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients" DROP CONSTRAINT "FK_fcadfe25d85cf21251273169128"
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ALTER COLUMN "company_id"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "FK_fcadfe25d85cf21251273169128" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "clients" DROP CONSTRAINT "FK_fcadfe25d85cf21251273169128"
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ALTER COLUMN "company_id" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD CONSTRAINT "FK_fcadfe25d85cf21251273169128" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
