import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPayRateTable1659286381727 implements MigrationInterface {
  name = 'CreateUserPayRateTable1659286381727';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user_payrate" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "start_date" TIMESTAMP,
                "end_date" TIMESTAMP,
                "amount" integer NOT NULL,
                "user_id" uuid NOT NULL,
                "project_id" uuid NOT NULL,
                CONSTRAINT "UQ_ec0739dace1bbeb0f00b91b09cf" UNIQUE ("user_id", "project_id"),
                CONSTRAINT "PK_7a890f2ff771c55c8de8f2f1758" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate"
            ADD CONSTRAINT "FK_3f49f03b01ce3ed1ba8a42103b2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate"
            ADD CONSTRAINT "FK_10b81a4111e10379e950c3a12f7" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_payrate" DROP CONSTRAINT "FK_10b81a4111e10379e950c3a12f7"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_payrate" DROP CONSTRAINT "FK_3f49f03b01ce3ed1ba8a42103b2"
        `);
    await queryRunner.query(`
            DROP TABLE "user_payrate"
        `);
  }
}
