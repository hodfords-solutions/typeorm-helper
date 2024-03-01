import { createConnection, getConnectionOptions } from 'typeorm';
import { User } from './entity/User';

// connection settings are in the "ormconfig.json" file
createConnection()
    .then(async (connection) => {
        // let b: FindConditions<Post> = {
        //     userId: '1'
        // };
        // let a = await PostRepository.make().pagination({
        //     where: { userId: 1 },
        //     orderBy: { id: 'DESC' }
        // }, { perPage: 1, page: 1 });
        // console.log(a);
        let users = await User.createQueryBuilder().limit(3).getMany();
        // await users.loadRelation(['latestPost', 'posts']);
        await users.loadRelation('posts', ['id', 'userId']);
        console.log(users);
        // console.log(users);
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
        setTimeout(() => {}, 2000000);
    })
    .catch((error) => console.log('Error: ', error));
