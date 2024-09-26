import { PostEntity } from '../sample/entities/post.entity';
import { PostRepository } from '../sample/repositories/post.repository';
import { PostCategoryEntity } from '../sample/entities/post-category.entity';
import { initializeTest } from './test-helper';
import { IsNull, Not } from 'typeorm';

describe('Many-To-Many Relation Owner Test Cases', () => {
    beforeAll(async () => {
        await initializeTest();
    });

    const assertSingle = async (post: PostEntity) => {
        const postCategories = await PostCategoryEntity.find({ where: { postId: post.id } });
        expect(post.categories.length).toBe(postCategories.length);

        for (const category of post.categories) {
            expect(postCategories).toEqual(
                expect.arrayContaining([expect.objectContaining({ categoryId: category.id })])
            );
        }
    };

    it('should validate a single post', async () => {
        const post = await PostRepository.make().findOneBy({ id: Not(IsNull()) });
        await post.loadRelation('categories');
        await assertSingle(post);
    });

    it('should validate multiple posts', async () => {
        const posts = await PostRepository.make().find({ take: 5 });
        await posts.loadRelation('categories');
        for (const post of posts) {
            await assertSingle(post);
        }
    });

    it('should validate post pagination', async () => {
        const pagination = await PostRepository.make().pagination({}, { page: 1, perPage: 10 });
        await pagination.loadRelation('categories');
        for (const post of pagination.items) {
            await assertSingle(post);
        }
    });
});
