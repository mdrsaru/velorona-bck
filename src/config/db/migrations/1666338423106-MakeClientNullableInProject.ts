import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeClientNullableInProject1666338423106 implements MigrationInterface {
  name = 'MakeClientNullableInProject1666338423106';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "projects" DROP CONSTRAINT "FK_ca29f959102228649e714827478"
        `);
    await queryRunner.query(`
            ALTER TABLE "projects"
            ALTER COLUMN "client_id" DROP NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "projects"
            ADD CONSTRAINT "FK_ca29f959102228649e714827478" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "projects" DROP CONSTRAINT "FK_ca29f959102228649e714827478"
        `);
    await queryRunner.query(`
            ALTER TABLE "projects"
            ALTER COLUMN "client_id"
            SET NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "projects"
            ADD CONSTRAINT "FK_ca29f959102228649e714827478" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
