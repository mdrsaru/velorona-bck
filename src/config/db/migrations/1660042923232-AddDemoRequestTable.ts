import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDemoRequestTable1660042923232 implements MigrationInterface {
  name = 'AddDemoRequestTable1660042923232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "demo_requests" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "full_name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "phone" character varying,
                "job_title" character varying,
                "status" character varying NOT NULL DEFAULT 'Pending',
                CONSTRAINT "PK_caebe842f55969080ee55adf186" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "demo_requests_email" ON "demo_requests" ("email")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."demo_requests_email"
        `);
    await queryRunner.query(`
            DROP TABLE "demo_requests"
        `);
  }
}
