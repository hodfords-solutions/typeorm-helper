import { randomInt } from 'crypto';
import { User } from '../src/entity/User';
import { Post } from '../src/entity/Post';
import { createConnection } from 'typeorm';
import { Category } from '../src/entity/Category';

export async function createUsers() {
    let count = randomInt(15, 30);
    for (let i = 0; i < count; i++) {
        let user = new User();
        user.name = `user_${i}`;
        await user.save();
    }
}

export async function createPosts() {
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

export async function createCategories() {
    let count = randomInt(15, 30);
    for (let i = 0; i < count; i++) {
        let category = new Category();
        category.name = `categories_${i}`;
        category.posts = await Post.createQueryBuilder().limit(randomInt(0, 5)).orderBy('random()').getMany();
        await category.save();
    }
}
