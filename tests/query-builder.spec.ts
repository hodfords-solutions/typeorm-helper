import { createConnection } from 'typeorm';
import '../lib';
import { UserEntity } from '../sample/entities/user.entity';
import { PostRepository } from '../sample/repositories/post.repository';
import { PostOfUserQuery } from '../sample/queries/post-of-user.query';

describe('Test query builder', () => {
    beforeAll(async () => {
        await createConnection();
    });

    it('Test post of id', async () => {
        let user = await UserEntity.createQueryBuilder().orderBy('random()').getOne();
        await user.loadRelation('posts');

        let posts = await PostRepository.make().find(new PostOfUserQuery(user.id));

        for (let post of posts) {
            expect(post.userId).toEqual(user.id);
        }
    });
});
