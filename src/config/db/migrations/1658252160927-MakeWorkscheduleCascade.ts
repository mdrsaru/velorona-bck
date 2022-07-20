import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeWorkscheduleCascade1658252160927 implements MigrationInterface {
  name = 'MakeWorkscheduleCascade1658252160927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "workschedule_details" DROP CONSTRAINT "FK_595c4788627be7460319691f495"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ADD CONSTRAINT "FK_595c4788627be7460319691f495" FOREIGN KEY ("workschedule_id") REFERENCES "workschedule"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "workschedule_details" DROP CONSTRAINT "FK_595c4788627be7460319691f495"
        `);
    await queryRunner.query(`
            ALTER TABLE "workschedule_details"
            ADD CONSTRAINT "FK_595c4788627be7460319691f495" FOREIGN KEY ("workschedule_id") REFERENCES "workschedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
