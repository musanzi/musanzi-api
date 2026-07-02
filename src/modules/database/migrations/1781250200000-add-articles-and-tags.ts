import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArticlesAndTags1781250200000 implements MigrationInterface {
  name = 'AddArticlesAndTags1781250200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying(80) NOT NULL, CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "article" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(180) NOT NULL, "slug" character varying(220) NOT NULL, "summary" text NOT NULL, "content" text NOT NULL, "contentFormat" character varying(20) NOT NULL DEFAULT 'mdx', "cover" character varying, "published" boolean NOT NULL DEFAULT false, "publishedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_364208c6f28bedb21077fd5947b" UNIQUE ("slug"), CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "article_tags" ("articleId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_1782019972dedbf2900e81425e5" PRIMARY KEY ("articleId", "tagId"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_b651178cc41334544a7a9601c4" ON "article_tags" ("articleId") `);
    await queryRunner.query(`CREATE INDEX "IDX_091a03fbf27f4e68b3b9a1317a" ON "article_tags" ("tagId") `);
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_b651178cc41334544a7a9601c4f" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_091a03fbf27f4e68b3b9a1317a3" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "article_tags" DROP CONSTRAINT "FK_091a03fbf27f4e68b3b9a1317a3"`);
    await queryRunner.query(`ALTER TABLE "article_tags" DROP CONSTRAINT "FK_b651178cc41334544a7a9601c4f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_091a03fbf27f4e68b3b9a1317a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b651178cc41334544a7a9601c4"`);
    await queryRunner.query(`DROP TABLE "article_tags"`);
    await queryRunner.query(`DROP TABLE "article"`);
    await queryRunner.query(`DROP TABLE "tag"`);
  }
}
