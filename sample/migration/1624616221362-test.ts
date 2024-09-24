import { MigrationInterface, QueryRunner } from 'typeorm';
import { createCategories, createPosts, createUsers } from '../../tests/test-helper';

export class Test1624616221362 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        setTimeout(async () => {
            await createUsers();
            await createPosts();
            await createCategories();
        }, 5000);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
