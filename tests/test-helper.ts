import { UserEntity } from '../sample/entities/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import { PostEntity } from '../sample/entities/post.entity';
import { CategoryEntity } from '../sample/entities/category.entity';
import { PostCategoryEntity } from '../sample/entities/post-category.entity';
import { setDataSource } from '@hodfords/typeorm-helper';
import { randomInt } from 'crypto';
import { PostRepository } from '../sample/repositories/post.repository';
import { CategoryRepository } from '../sample/repositories/category.repository';
import { UserRepository } from '../sample/repositories/user.repository';

export async function initializeTest(): Promise<void> {
    const options: DataSourceOptions = {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'quickstart',
        entities: [UserEntity, PostEntity, CategoryEntity, PostCategoryEntity],
        synchronize: true,
        dropSchema: true
    };

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    setDataSource(dataSource);
    await seedEntities();
}

export async function seedEntities(): Promise<void> {
    await seedUsers();
    await seedPosts();
    await seedCategories();
}

async function seedUsers() {
    for (let i = 0; i < randomInt(15, 30); i++) {
        await UserRepository.make().createOne({ name: `user_${i}` });
    }
}

async function seedPosts() {
    const users = await UserRepository.make().find();
    for (const user of users) {
        for (let i = 0; i < randomInt(15, 30); i++) {
            await PostRepository.make().createOne({
                title: `post_${i}`,
                userId: user.id
            });
        }
    }
}

async function seedCategories() {
    for (let i = 0; i < randomInt(15, 30); i++) {
        const randomPosts = await PostRepository.make()
            .createQueryBuilder()
            .limit(randomInt(0, 5))
            .orderBy('random()')
            .getMany();
        await CategoryRepository.make().createOne({
            name: `category_${i}`,
            posts: randomPosts
        });
    }
}
