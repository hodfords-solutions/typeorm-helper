import { createConnection, getConnection, In } from 'typeorm';
import { Post } from '../src/entity/Post';
import '../libs';
import { PostRepository } from '../src/repositories/PostRepository';
import { createCategories, createPosts, createUsers } from './test-helper';
import { PostCategory } from '../src/entity/PostCategory';
import { Category } from '../src/entity/Category';
import { CategoryRepository } from '../src/repositories/CategoryRepository';

describe('Test relations many to many', () => {
    beforeAll(async () => {
        await createConnection();
    });

    const testSinglePost = async (category: Category) => {
        let postCategories = await PostCategory.find({ where: { categoryId: category.id } });
        expect(category.posts.length).toEqual(postCategories.length);
        for (let post of category.posts) {
            expect(postCategories).toEqual(expect.arrayContaining([expect.objectContaining({ postId: post.id })]));
        }
    };
    it('Single', async () => {
        let category = await Category.findOne();
        await category.loadRelation('posts');
        await testSinglePost(category);
    });

    it('Multiple', async () => {
        let categories = await Category.createQueryBuilder().limit(2).orderBy('random()').getMany();
        await categories.loadRelation('posts');

        for (let category of categories) {
            await testSinglePost(category);
        }
    });

    it('Multiple with repository', async () => {
        let categoryRepo = Category.getRepository();
        let categories = await categoryRepo.find();
        await categories.loadRelation('posts');

        for (let category of categories) {
            await testSinglePost(category);
        }
    });

    it('Multiple with custom Repository', async () => {
        let categoryRepo = getConnection().getCustomRepository(CategoryRepository);
        let categories = await categoryRepo.find();
        await categories.loadRelation('posts');

        for (let category of categories) {
            await testSinglePost(category);
        }
    });

    it('Pagination', async () => {
        let categoryRepo = getConnection().getCustomRepository(CategoryRepository);
        let categoryPaginationCollection = await categoryRepo.pagination({}, { page: 1, perPage: 10 });
        await categoryPaginationCollection.loadRelation('posts');

        for (let category of categoryPaginationCollection.items) {
            await testSinglePost(category);
        }
    });
});
