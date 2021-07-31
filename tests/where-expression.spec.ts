import { createConnection } from 'typeorm';
import '../libs';
import { User } from '../src/entity/User';
import { PostRepository } from '../src/repositories/PostRepository';
import { PostOfUserQuery } from '../src/queries/post-of-user.query';
import { BelongToUserWhereExpression } from '../src/where-expression/belong-to-user.where-expression';

describe('Test where expression', () => {
    beforeAll(async () => {
        await createConnection();
    });

    it('Test post of id', async () => {
        let user = await User.createQueryBuilder().orderBy('random()').getOne();
        await user.loadRelation('posts');

        let posts = await PostRepository.make().find({
            where: new BelongToUserWhereExpression(user.id)
        });

        for (let post of posts) {
            expect(post.userId).toEqual(user.id);
        }
    });
});
