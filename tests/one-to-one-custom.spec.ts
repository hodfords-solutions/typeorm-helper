import { UserRepository } from '../sample/repositories/user.repository';
import { PostEntity } from '../sample/entities/post.entity';
import { initializeTest } from './test-helper';
import { PostRepository } from '../sample/repositories/post.repository';
import { IsNull, Not } from 'typeorm';

describe('One-To-One Relation Test Cases', () => {
    beforeAll(async () => {
        await initializeTest();
    });

    const assertLatestPost = async (userId: number, post: PostEntity) => {
        const latestPost = await PostRepository.make()
            .createQueryBuilder()
            .where('"userId" = :userId ', { userId })
            .orderBy('id', 'DESC')
            .limit(1)
            .getOne();
        expect(latestPost.id).toEqual(post.id);
    };

    it('should validate the latest post for a single user', async () => {
        const user = await UserRepository.make().findOneBy({ id: Not(IsNull()) });
        await user.loadRelation('latestPost');
        await assertLatestPost(user.id, user.latestPost);
    });

    it('should validate the latest post for multiple users', async () => {
        const users = await UserRepository.make().find({ take: 5 });
        await users.loadRelation('latestPost');
        for (const user of users) {
            await assertLatestPost(user.id, user.latestPost);
        }
    });

    it('should validate pagination of users and their latest posts', async () => {
        const pagination = await UserRepository.make().pagination({}, { page: 1, perPage: 10 });
        await pagination.loadRelation('latestPost');
        for (const user of pagination.items) {
            await assertLatestPost(user.id, user.latestPost);
        }
    });
});
