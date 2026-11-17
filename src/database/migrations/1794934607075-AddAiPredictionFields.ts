import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiPredictionFields1794934607075 implements MigrationInterface {
    name = 'AddAiPredictionFields1794934607075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" ADD "aiUrgency" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "aiConfidence" double precision`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "aiPredictedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "aiPredictedAt"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "aiConfidence"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "aiUrgency"`);
    }

}
