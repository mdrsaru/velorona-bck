import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionColumnInTimeEntry1657097449739 implements MigrationInterface {
  name = 'AddDescriptionColumnInTimeEntry1657097449739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD "description" character varying
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_entries" DROP COLUMN "description"
        `);
  }
}
