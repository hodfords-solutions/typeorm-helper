import { createConnection, getConnection } from 'typeorm';
import { User } from './src/entity/User';
import { randomInt } from 'crypto';
import { Post } from './src/entity/Post';
import './libs';
import { PostRepository } from './src/repositories/PostRepository';

async function createUsers() {
    let count = randomInt(15, 30);
    for (let i = 0; i < count; i++) {
        let user = new User();
        user.name = `user_${i}`;
        await user.save();
    }
}

async function createPosts() {
    let users = await User.find();
    for (let user of users) {
        let count = randomInt(15, 30);
        for (let i = 0; i < count; i++) {
            let post = new Post();
            post.title = `post_${i}`;
            post.user = user;
            await post.save();
        }
    }
}

describe('Test relations', () => {
    beforeAll(async () => {
        await createConnection();
        // await createUsers();
        // await createPosts();
    });

    it('Test relation many to one single', async () => {
        let post = await Post.findOne();
        await post.loadRelation('user');
        expect(post.userId).toEqual(post.user.id);
    });

    it('Test relation many to one multiple', async () => {
        let posts = await Post.createQueryBuilder().limit(10).orderBy('random()').getMany();
        await posts.loadRelation('user');

        for (let post of posts) {
            expect(post.userId).toEqual(post.user.id);
        }
    });

    it('Test relation many to one multiple with repository', async () => {
        let postRepo = Post.getRepository();
        let posts = await postRepo.find();
        await posts.loadRelation('user');

        for (let post of posts) {
            expect(post.userId).toEqual(post.user.id);
        }
    });

    it('Test relation many to one multiple with custom Repository', async () => {
        let postRepo = getConnection().getCustomRepository(PostRepository);
        let posts = await postRepo.find();
        await posts.loadRelation('user');

        for (let post of posts) {
            expect(post.userId).toEqual(post.user.id);
        }
    });

    it('Test relation many to one Pagination', async () => {
        let postRepo = getConnection().getCustomRepository(PostRepository);
        let postPagination = await postRepo.pagination({}, { page: 1, perPage: 10 });
        await postPagination.loadRelation('user');

        for (let post of postPagination.items) {
            expect(post.userId).toEqual(post.user.id);
        }
    });
});
