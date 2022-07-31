import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserClientTable1659286707461 implements MigrationInterface {
  name = 'CreateUserClientTable1659286707461';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users_clients" (
                "status" character varying NOT NULL,
                "user_id" uuid NOT NULL,
                "client_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_04e047a4375832031896bb4d59d" PRIMARY KEY ("user_id", "client_id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "users_clients"
            ADD CONSTRAINT "FK_1e5411dacfbb742eafce27d8c86" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "users_clients"
            ADD CONSTRAINT "FK_410f7c875e1b512ef6477a3baab" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users_clients" DROP CONSTRAINT "FK_410f7c875e1b512ef6477a3baab"
        `);
    await queryRunner.query(`
            ALTER TABLE "users_clients" DROP CONSTRAINT "FK_1e5411dacfbb742eafce27d8c86"
        `);
    await queryRunner.query(`
            DROP TABLE "users_clients"
        `);
  }
}
