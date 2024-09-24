import { createConnection, getConnection } from 'typeorm';
import { PostEntity } from '../sample/entities/post.entity';
import '../lib';
import { PostRepository } from '../sample/repositories/post.repository';
import { createCategories, createPosts, createUsers } from './test-helper';

describe('Test relations many to one', () => {
    beforeAll(async () => {
        await createConnection();
        // await createUsers();
        // await createPosts();
    });

    it('Single', async () => {
        let post = await PostEntity.findOne();
        await post.loadRelation('user');
        expect(post.userId).toEqual(post.user.id);
    });

    it('Multiple', async () => {
        let posts = await PostEntity.createQueryBuilder().limit(10).orderBy('random()').getMany();
        await posts.loadRelation('user');

        for (let post of posts) {
            expect(post.userId).toEqual(post.user.id);
        }
    });

    it('Multiple with repository', async () => {
        let postRepo = PostEntity.getRepository();
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
        let postPagination = await postRepo.pagination({}, { page: 1, perPage: 10 });
        await postPagination.loadRelation('user');

        for (let post of postPagination.items) {
            expect(post.userId).toEqual(post.user.id);
        }
    });
});
