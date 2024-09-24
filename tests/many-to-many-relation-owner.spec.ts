import { createConnection, getConnection, In } from 'typeorm';
import { PostEntity } from '../sample/entities/post.entity';
import '../lib';
import { PostRepository } from '../sample/repositories/post.repository';
import { createCategories, createPosts, createUsers } from './test-helper';
import { PostCategoryEntity } from '../sample/entities/post-category.entity';

describe('Test relations many to many', () => {
    beforeAll(async () => {
        await createConnection();
    });

    const testSinglePost = async (post: PostEntity) => {
        let postCategories = await PostCategoryEntity.find({ where: { postId: post.id } });
        expect(post.categories.length).toEqual(postCategories.length);
        for (let category of post.categories) {
            expect(postCategories).toEqual(
                expect.arrayContaining([expect.objectContaining({ categoryId: category.id })])
            );
        }
    };
    it('Single', async () => {
        let post = await PostEntity.findOne();
        await post.loadRelation('categories');
        await testSinglePost(post);
    });

    it('Multiple', async () => {
        let posts = await PostEntity.createQueryBuilder().limit(2).orderBy('random()').getMany();
        await posts.loadRelation('categories');

        for (let post of posts) {
            await testSinglePost(post);
        }
    });

    it('Multiple with repository', async () => {
        let postRepo = PostEntity.getRepository();
        let posts = await postRepo.find();
        await posts.loadRelation('categories');

        for (let post of posts) {
            await testSinglePost(post);
        }
    });

    it('Multiple with custom Repository', async () => {
        let postRepo = getConnection().getCustomRepository(PostRepository);
        let posts = await postRepo.find();
        await posts.loadRelation('categories');

        for (let post of posts) {
            await testSinglePost(post);
        }
    });

    it('Pagination', async () => {
        let postRepo = getConnection().getCustomRepository(PostRepository);
        let postPagination = await postRepo.pagination({}, { page: 1, perPage: 10 });
        await postPagination.loadRelation('categories');

        for (let post of postPagination.items) {
            await testSinglePost(post);
        }
    });
});
