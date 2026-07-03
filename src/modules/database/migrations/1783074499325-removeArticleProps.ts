import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveArticleProps1783074499325 implements MigrationInterface {
    name = 'RemoveArticleProps1783074499325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "contentFormat"`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "published"`);
        await queryRunner.query(`ALTER TABLE "project" ALTER COLUMN "links" SET DEFAULT '[]'::jsonb`);
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "publishedAt" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ALTER COLUMN "publishedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "project" ALTER COLUMN "links" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "article" ADD "published" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "article" ADD "contentFormat" character varying(20) NOT NULL DEFAULT 'mdx'`);
    }

}
