import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriorityFields1794983254810 implements MigrationInterface {
    name = 'AddPriorityFields1794983254810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" ADD "severityScore" integer`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "publicImpactScore" integer`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "safetyRiskScore" integer`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "priorityScore" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "priorityScore"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "safetyRiskScore"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "publicImpactScore"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "severityScore"`);
    }

}
