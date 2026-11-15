import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssignedByToComplaint1794504456273 implements MigrationInterface {
    name = 'AddAssignedByToComplaint1794504456273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" ADD "assigned_by_id" uuid`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD CONSTRAINT "FK_dc90655e33c200260182a750665" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" DROP CONSTRAINT "FK_dc90655e33c200260182a750665"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "assigned_by_id"`);
    }

}
