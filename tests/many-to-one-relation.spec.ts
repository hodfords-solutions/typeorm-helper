import { PostEntity } from 'sample/entities/post.entity';
import { PostRepository } from '../sample/repositories/post.repository';
import { initializeTest } from './test-helper';
import { IsNull, Not } from 'typeorm';

describe('Many-To-One Relation Test Cases', () => {
    beforeAll(async () => {
        await initializeTest();
    });

    const assertSingle = async (post: PostEntity) => {
        expect(post.userId).toEqual(post.user.id);
    };

    it('should validate a single post', async () => {
        const post = await PostRepository.make().findOneBy({ id: Not(IsNull()) });
        await post.loadRelation('user');
        assertSingle(post);
    });

    it('should validate multiple posts', async () => {
        const posts = await PostRepository.make().find({ take: 5 });
        await posts.loadRelation('user');
        for (const post of posts) {
            assertSingle(post);
        }
    });

    it('should validate post pagination', async () => {
        const pagination = await PostRepository.make().pagination({}, { page: 1, perPage: 10 });
        await pagination.loadRelation('user');
        for (const post of pagination.items) {
            assertSingle(post);
        }
    });
});
