import { PostRepository } from '../sample/repositories/post.repository';
import { PostOfUserQuery } from '../sample/queries/post-of-user.query';
import { initializeTest } from './test-helper';
import { UserRepository } from '../sample/repositories/user.repository';
import { IsNull, Not } from 'typeorm';

describe('Query Builder Test Cases', () => {
    beforeAll(async () => {
        await initializeTest();
    });

    it('should return posts of a specific user by id', async () => {
        const user = await UserRepository.make().findOneBy({ id: Not(IsNull()) });
        await user.loadRelation('posts');

        const posts = await PostRepository.make().find(new PostOfUserQuery(user.id));
        for (const post of posts) {
            expect(post.userId).toEqual(user.id);
        }
    });
});
