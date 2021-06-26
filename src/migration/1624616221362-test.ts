import { MigrationInterface, QueryRunner } from 'typeorm';
import { createCategories, createPosts, createUsers } from '../../tests/test-helper';

export class test1624616221362 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await createUsers();
        await createPosts();
        await createCategories();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
