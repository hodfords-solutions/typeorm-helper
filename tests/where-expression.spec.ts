import { createConnection } from 'typeorm';
import '../lib';
import { UserEntity } from '../sample/entities/user.entity';
import { PostRepository } from '../sample/repositories/post.repository';
import { PostOfUserQuery } from '../sample/queries/post-of-user.query';
import { BelongToUserWhereExpression } from '../sample/where-expression/belong-to-user.where-expression';

describe('Test where expression', () => {
    beforeAll(async () => {
        await createConnection();
    });

    it('Test post of id', async () => {
        let user = await UserEntity.createQueryBuilder().orderBy('random()').getOne();
        await user.loadRelation('posts');

        let posts = await PostRepository.make().find({
            where: new BelongToUserWhereExpression(user.id)
        });

        for (let post of posts) {
            expect(post.userId).toEqual(user.id);
        }
    });
});
