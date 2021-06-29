import { MigrationInterface, QueryRunner } from 'typeorm';
import { createCategories, createPosts, createUsers } from '../../tests/test-helper';

export class test1624616221360 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            CREATE SEQUENCE category_id_seq START 1;

CREATE TABLE "public"."category" (
    "id" integer DEFAULT nextval('category_id_seq') NOT NULL,
    "name" character varying NOT NULL,
    CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE SEQUENCE post_id_seq START 1;

CREATE TABLE "public"."post" (
    "id" integer DEFAULT nextval('post_id_seq') NOT NULL,
    "title" character varying NOT NULL,
    "userId" integer,
    CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE SEQUENCE "postCategories_id_seq"  START 1;

CREATE TABLE "public"."postCategories" (
    "id" integer DEFAULT nextval('"postCategories_id_seq"') NOT NULL,
    "postId" integer,
    "categoryId" integer,
    CONSTRAINT "PK_7f313e1d05c22db801f02769588" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE SEQUENCE user_id_seq START 1;

CREATE TABLE "public"."user" (
    "id" integer DEFAULT nextval('user_id_seq') NOT NULL,
    "name" character varying NOT NULL,
    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
) WITH (oids = false);


ALTER TABLE ONLY "public"."post" ADD CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user"(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."postCategories" ADD CONSTRAINT "FK_3bf2fed7d3ad8c82e21d308913e" FOREIGN KEY ("categoryId") REFERENCES category(id) NOT DEFERRABLE;
ALTER TABLE ONLY "public"."postCategories" ADD CONSTRAINT "FK_e31f6fbb456b1333e4dac6ea280" FOREIGN KEY ("postId") REFERENCES post(id) NOT DEFERRABLE;
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
