import { PostCategoryEntity } from '../sample/entities/post-category.entity';
import { CategoryEntity } from '../sample/entities/category.entity';
import { CategoryRepository } from '../sample/repositories/category.repository';
import { initializeTest } from './test-helper';
import { IsNull, Not } from 'typeorm';

describe('Many-To-Many Relation Not Owner Test Cases', () => {
    beforeAll(async () => {
        await initializeTest();
    });

    const assertSingle = async (category: CategoryEntity) => {
        const postCategories = await PostCategoryEntity.find({ where: { categoryId: category.id } });
        expect(category.posts.length).toBe(postCategories.length);

        for (const post of category.posts) {
            expect(postCategories).toEqual(expect.arrayContaining([expect.objectContaining({ postId: post.id })]));
        }
    };

    it('should validate a single category', async () => {
        const category = await CategoryRepository.make().findOneBy({ id: Not(IsNull()) });
        await category.loadRelation('posts');
        await assertSingle(category);
    });

    it('should validate multiple categories', async () => {
        const categories = await CategoryRepository.make().find({ take: 5 });
        await categories.loadRelation('posts');
        for (const category of categories) {
            await assertSingle(category);
        }
    });

    it('should validate category pagination', async () => {
        const pagination = await CategoryRepository.make().pagination({}, { page: 1, perPage: 10 });
        await pagination.loadRelation('posts');
        for (const category of pagination.items) {
            await assertSingle(category);
        }
    });
});
