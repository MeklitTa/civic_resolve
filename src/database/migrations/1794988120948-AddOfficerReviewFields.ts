import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOfficerReviewFields1794988120948 implements MigrationInterface {
    name = 'AddOfficerReviewFields1794988120948'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" ADD "officerUrgency" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "officerReviewNote" text`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "reviewedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "reviewed_by_id" uuid`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD CONSTRAINT "FK_85dc46753cd5362fa117eab7dec" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" DROP CONSTRAINT "FK_85dc46753cd5362fa117eab7dec"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "reviewed_by_id"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "reviewedAt"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "officerReviewNote"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "officerUrgency"`);
    }

}
