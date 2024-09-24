import { randomInt } from 'crypto';
import { UserEntity } from '../sample/entities/user.entity';
import { PostEntity } from '../sample/entities/post.entity';
import { createConnection } from 'typeorm';
import { CategoryEntity } from '../sample/entities/category.entity';

export async function createUsers() {
    let count = randomInt(15, 30);
    for (let i = 0; i < count; i++) {
        let user = new UserEntity();
        user.name = `user_${i}`;
        await user.save();
    }
}

export async function createPosts() {
    let users = await UserEntity.find();
    for (let user of users) {
        let count = randomInt(15, 30);
        for (let i = 0; i < count; i++) {
            let post = new PostEntity();
            post.title = `post_${i}`;
            post.user = user;
            await post.save();
        }
    }
}

export async function createCategories() {
    let count = randomInt(15, 30);
    for (let i = 0; i < count; i++) {
        let category = new CategoryEntity();
        category.name = `categories_${i}`;
        category.posts = await PostEntity.createQueryBuilder().limit(randomInt(0, 5)).orderBy('random()').getMany();
        await category.save();
    }
}
