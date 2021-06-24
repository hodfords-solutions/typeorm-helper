import {createConnection, getConnection} from 'typeorm';
import {Post} from '../src/entity/Post';
import '../libs';
import {PostRepository} from '../src/repositories/PostRepository';

describe('Test relations many to one', () => {
    beforeAll(async () => {
        await createConnection();
    });

    it('Single', async () => {
        let post = await Post.findOne();
        await post.loadRelation('user');
        expect(post.userId).toEqual(post.user.id);
    });

    it('Multiple', async () => {
        let posts = await Post.createQueryBuilder().limit(10).orderBy('random()').getMany();
        await posts.loadRelation('user');

        for (let post of posts) {
            expect(post.userId).toEqual(post.user.id);
        }
    });

    it('Multiple with repository', async () => {
        let postRepo = Post.getRepository();
        let posts = await postRepo.find();
        await posts.loadRelation('user');

        for (let post of posts) {
            expect(post.userId).toEqual(post.user.id);
        }
    });

    it('Multiple with custom Repository', async () => {
        let postRepo = getConnection().getCustomRepository(PostRepository);
        let posts = await postRepo.find();
        await posts.loadRelation('user');

        for (let post of posts) {
            expect(post.userId).toEqual(post.user.id);
        }
    });

    it('Pagination', async () => {
        let postRepo = getConnection().getCustomRepository(PostRepository);
        let postPagination = await postRepo.pagination({}, {page: 1, perPage: 10});
        await postPagination.loadRelation('user');

        for (let post of postPagination.items) {
            expect(post.userId).toEqual(post.user.id);
        }
    });
});
