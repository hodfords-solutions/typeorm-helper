import { createConnection } from 'typeorm';
import { User } from './src/entity/User';
import { randomInt } from 'crypto';
import { Post } from './src/entity/Post';
import './libs';

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

    it('Test relation many to one', async () => {
        // let user = await User.findOne();
        // await user.loadRelation('posts');

        let post = await Post.findOne();
        await post.loadRelation('user');
        expect(post.userId).toEqual(post.user.id);

        let posts = await Post.createQueryBuilder().limit(10).orderBy('random()').getMany();
        await posts.loadRelation('user');

        for (let post of posts) {
            expect(post.userId).toEqual(post.user.id);
        }

        let postRepo = Post.getRepository();

        let postRepos = await postRepo.find();
        await postRepos.loadRelation('user');

        for (let post of postRepos) {
            expect(post.userId).toEqual(post.user.id);
        }
    });
});
