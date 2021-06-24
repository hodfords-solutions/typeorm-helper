import {randomInt} from 'crypto';
import {User} from '../src/entity/User';
import {Post} from '../src/entity/Post';
import {createConnection} from 'typeorm';

async function createUsers() {
    let count = randomInt(15, 30);
    for (let i = 0; i < count; i++) {
        let user = new User();
        user.name = `user_${i}`;
        await user.save();
    }
}

async function createPosts() {
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

