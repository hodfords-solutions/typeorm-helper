import { createConnection } from 'typeorm';
import '../libs';
import { User } from '../src/entity/User';
import { PostRepository } from '../src/repositories/PostRepository';
import { PostOfUserQuery } from '../src/queries/post-of-user.query';

describe('Test query builder', () => {
    beforeAll(async () => {
        await createConnection();
    });

    it('Test post of id', async () => {
        let user = await User.createQueryBuilder().orderBy('random()').getOne();
        await user.loadRelation('posts');

        let posts = await PostRepository.make().find(new PostOfUserQuery(user.id));

        for (let post of posts) {
            expect(post.userId).toEqual(user.id);
        }
    });
});
