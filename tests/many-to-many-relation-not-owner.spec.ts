import { createConnection, getConnection, In } from 'typeorm';
import { PostEntity } from '../sample/entities/post.entity';
import '../lib';
import { PostRepository } from '../sample/repositories/post.repository';
import { createCategories, createPosts, createUsers } from './test-helper';
import { PostCategoryEntity } from '../sample/entities/post-category.entity';
import { CategoryEntity } from '../sample/entities/category.entity';
import { CategoryRepository } from '../sample/repositories/category.repository';

describe('Test relations many to many', () => {
    beforeAll(async () => {
        await createConnection();
    });

    const testSinglePost = async (category: CategoryEntity) => {
        let postCategories = await PostCategoryEntity.find({ where: { categoryId: category.id } });
        expect(category.posts.length).toEqual(postCategories.length);
        for (let post of category.posts) {
            expect(postCategories).toEqual(expect.arrayContaining([expect.objectContaining({ postId: post.id })]));
        }
    };
    it('Single', async () => {
        let category = await CategoryEntity.findOne();
        await category.loadRelation('posts');
        await testSinglePost(category);
    });

    it('Multiple', async () => {
        let categories = await CategoryEntity.createQueryBuilder().limit(2).orderBy('random()').getMany();
        await categories.loadRelation('posts');

        for (let category of categories) {
            await testSinglePost(category);
        }
    });

    it('Multiple with repository', async () => {
        let categoryRepo = CategoryEntity.getRepository();
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
