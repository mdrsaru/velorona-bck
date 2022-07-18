import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeWorkscheduleTimeDetailCascade1657863271049 implements MigrationInterface {
  name = 'MakeWorkscheduleTimeDetailCascade1657863271049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details" DROP CONSTRAINT "FK_d3e80953f29bb964a951ebd3d75"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details"
            ADD CONSTRAINT "FK_d3e80953f29bb964a951ebd3d75" FOREIGN KEY ("workschedule_detail_id") REFERENCES "workschedule_details"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details" DROP CONSTRAINT "FK_d3e80953f29bb964a951ebd3d75"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_time_details"
            ADD CONSTRAINT "FK_d3e80953f29bb964a951ebd3d75" FOREIGN KEY ("workschedule_detail_id") REFERENCES "workschedule_details"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }
}
