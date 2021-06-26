import { createConnection, getConnection, In } from 'typeorm';
import { Post } from '../src/entity/Post';
import '../libs';
import { PostRepository } from '../src/repositories/PostRepository';
import { createCategories, createPosts, createUsers } from './test-helper';
import { PostCategory } from '../src/entity/PostCategory';

describe('Test relations many to many', () => {
    beforeAll(async () => {
        await createConnection();
    });

    const testSinglePost = async (post: Post) => {
        // let postCategories = await PostCategory.find({ where: { postId: post.id } });
        // console.log(post, post.categories.length, postCategories);
        // expect(post.categories.length).toEqual(postCategories.length);
        // for (let category of post.categories) {
        //     expect(postCategories).toEqual(expect.arrayContaining([expect.objectContaining({ categoryId: category.id })]));
        // }
    };
    // it('Single', async () => {
    //     let post = await Post.findOne();
    //     await post.loadRelation('categories');
    //     await testSinglePost(post);
    // });
    //
    it('Multiple', async () => {
        let posts = await Post.createQueryBuilder().limit(2).orderBy('random()').getMany();
        await posts.loadRelation('categories');

        for (let post of posts) {
            await testSinglePost(post);
        }
    });
    //
    // it('Multiple with repository', async () => {
    //     let postRepo = Post.getRepository();
    //     let posts = await postRepo.find();
    //     await posts.loadRelation('categories');
    //
    //     for (let post of posts) {
    //         await testSinglePost(post);
    //     }
    // });
    //
    // it('Multiple with custom Repository', async () => {
    //     let postRepo = getConnection().getCustomRepository(PostRepository);
    //     let posts = await postRepo.find();
    //     await posts.loadRelation('categories');
    //
    //     for (let post of posts) {
    //         await testSinglePost(post);
    //     }
    // });
    //
    // it('Pagination', async () => {
    //     let postRepo = getConnection().getCustomRepository(PostRepository);
    //     let postPagination = await postRepo.pagination({}, { page: 1, perPage: 10 });
    //     await postPagination.loadRelation('categories');
    //
    //     for (let post of postPagination.items) {
    //         await testSinglePost(post);
    //     }
    // });
});
