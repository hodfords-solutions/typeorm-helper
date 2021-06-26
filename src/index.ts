import { createConnection } from 'typeorm';
import { Post } from './entity/Post';
import { Category } from './entity/Category';
import { createCategories, createPosts, createUsers } from '../tests/test-helper';
import { PostCategory } from './entity/PostCategory';
import { User } from './entity/User';

// connection settings are in the "ormconfig.json" file
createConnection()
    .then(async (connection) => {
        let users = await User.createQueryBuilder().limit(2).getMany();
        await users.loadRelation('posts');
        console.log(users);
        // let categories = await Category.createQueryBuilder().limit(2).getMany();
        // await categories.loadRelation('posts');
        //
        // console.log(categories);
        // let posts = await Post.createQueryBuilder().limit(4).getMany();
        // await posts.loadRelation('categories');
        // // let a = await Category.createQueryBuilder()
        // //     .innerJoinAndMapOne('Category.relation', 'Category.postCategories', 'postCategories', ' "Category".id = "postCategories"."categoryId" ')
        // //     .getOne();
        // // console.log(a);
        // console.log(posts);
        setTimeout(() => {
        }, 2000000);
    })
    .catch((error) => console.log('Error: ', error));
