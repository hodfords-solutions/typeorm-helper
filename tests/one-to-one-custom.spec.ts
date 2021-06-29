import { createConnection, getConnection } from 'typeorm';
import '../libs';
import { User } from '../src/entity/User';
import { UserRepository } from '../src/repositories/UserRepository';
import { loadRelations } from '../libs/helper';
import { Post } from '../src/entity/Post';

describe('Test relations one to many', () => {
    beforeAll(async () => {
        await createConnection();
    });

    let checkLatestPostOfUser = async (userId, post) => {
        let latestPost = await Post.createQueryBuilder()
            .where('"userId" = :userId ', { userId })
            .orderBy('id', 'DESC')
            .limit(1)
            .getOne();
        expect(latestPost.id).toEqual(post.id);
    };

    it('Single', async () => {
        let user = await User.createQueryBuilder().orderBy('random()').getOne();
        await user.loadRelation('latestPost');
        await checkLatestPostOfUser(user.id, user.latestPost);
    });

    it('Multiple', async () => {
        let users = await User.createQueryBuilder().limit(10).orderBy('random()').getMany();
        await users.loadRelation('latestPost');

        for (let user of users) {
            await checkLatestPostOfUser(user.id, user.latestPost);
        }
    });

    it('Multiple with repository', async () => {
        let userRepo = User.getRepository();
        let users = await userRepo.find();
        await users.loadRelation('latestPost');

        for (let user of users) {
            await checkLatestPostOfUser(user.id, user.latestPost);
        }
    });

    it('Multiple with custom Repository', async () => {
        let userRepo = getConnection().getCustomRepository(UserRepository);
        let users = await userRepo.find();
        await users.loadRelation(['latestPost']);

        for (let user of users) {
            await checkLatestPostOfUser(user.id, user.latestPost);
        }
    });

    it('Pagination', async () => {
        let userRepo = getConnection().getCustomRepository(UserRepository);
        let userPagination = await userRepo.pagination({}, { page: 1, perPage: 10 });
        await userPagination.loadRelation('latestPost');

        for (let user of userPagination.items) {
            await checkLatestPostOfUser(user.id, user.latestPost);
        }
    });
});
