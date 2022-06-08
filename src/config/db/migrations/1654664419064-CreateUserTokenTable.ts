import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTokenTable1654664419064 implements MigrationInterface {
  name = 'CreateUserTokenTable1654664419064';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user_tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "token_type" character varying NOT NULL,
                "token" text NOT NULL,
                "expiresIn" TIMESTAMP NOT NULL,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_63764db9d9aaa4af33e07b2f4bf" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_525620f08d28ebc7891104e1ed" ON "user_tokens" ("token_type")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_4e993847043f5bf10656b91798" ON "user_tokens" ("token")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9e144a67be49e5bba91195ef5d" ON "user_tokens" ("user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "user_tokens"
            ADD CONSTRAINT "FK_9e144a67be49e5bba91195ef5de" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_tokens" DROP CONSTRAINT "FK_9e144a67be49e5bba91195ef5de"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9e144a67be49e5bba91195ef5d"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_4e993847043f5bf10656b91798"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_525620f08d28ebc7891104e1ed"
        `);
    await queryRunner.query(`
            DROP TABLE "user_tokens"
        `);
  }
}
