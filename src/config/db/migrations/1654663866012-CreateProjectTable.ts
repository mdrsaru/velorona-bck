import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectTable1654663866012 implements MigrationInterface {
  name = 'CreateProjectTable1654663866012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying(50) NOT NULL,
                "company_id" uuid NOT NULL,
                "status" character varying DEFAULT 'Active',
                "archived" boolean NOT NULL DEFAULT false,
                "client_id" uuid NOT NULL,
                CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "projects"
            ADD CONSTRAINT "FK_c8708288b8e6a060ed7b9e1a226" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE "projects" DROP CONSTRAINT "FK_c8708288b8e6a060ed7b9e1a226"
        `);
    await queryRunner.query(`
            DROP TABLE "projects"
        `);
  }
}
