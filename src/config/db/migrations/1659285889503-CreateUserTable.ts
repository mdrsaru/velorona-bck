import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1659285889503 implements MigrationInterface {
  name = 'CreateUserTable1659285889503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "email" character varying(64) NOT NULL,
                "password" character varying NOT NULL,
                "phone" character varying,
                "first_name" character varying(25),
                "middle_name" character varying(25),
                "last_name" character varying(25),
                "status" character varying NOT NULL DEFAULT 'Active',
                "entry_type" character varying,
                "archived" boolean NOT NULL DEFAULT false,
                "avatar_id" uuid,
                "start_date" TIMESTAMP,
                "end_date" TIMESTAMP,
                "timesheet_attachment" boolean DEFAULT false,
                "company_id" uuid,
                "address_id" uuid,
                "manager_id" uuid,
                CONSTRAINT "unique_company_email" UNIQUE ("email", "company_id"),
                CONSTRAINT "REL_c3401836efedec3bec459c8f81" UNIQUE ("avatar_id"),
                CONSTRAINT "REL_1b05689f6b6456680d538c3d2e" UNIQUE ("address_id"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "user_email" ON "users" ("email")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_first_name" ON "users" ("first_name")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_last_name" ON "users" ("last_name")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_status" ON "users" ("status")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_type" ON "users" ("entry_type")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_archived" ON "users" ("archived")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_start_date_index" ON "users" ("start_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_end_date_index" ON "users" ("end_date")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_timesheet_attachment_index" ON "users" ("timesheet_attachment")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_company_id" ON "users" ("company_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "user_manager_id" ON "users" ("manager_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "user_id" uuid NOT NULL,
                "role_id" uuid NOT NULL,
                CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_c3401836efedec3bec459c8f818" FOREIGN KEY ("avatar_id") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_1b05689f6b6456680d538c3d2ea" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_fba2d8e029689aa8fea98e53c91" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles"
            ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"
        `);
    await queryRunner.query(`
            ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_fba2d8e029689aa8fea98e53c91"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_1b05689f6b6456680d538c3d2ea"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_7ae6334059289559722437bcc1c"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_c3401836efedec3bec459c8f818"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"
        `);
    await queryRunner.query(`
            DROP TABLE "user_roles"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_manager_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_company_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_timesheet_attachment_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_end_date_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_start_date_index"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_archived"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_status"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_last_name"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_first_name"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."user_email"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
  }
}
