import { IsNull, Not } from 'typeorm';
import { UserEntity } from '../sample/entities/user.entity';
import { UserRepository } from '../sample/repositories/user.repository';
import { initializeTest } from './test-helper';

describe('One-To-Many Relation Test Cases', () => {
    beforeAll(async () => {
        await initializeTest();
    });

    const assertSingle = async (user: UserEntity) => {
        for (const post of user.posts) {
            expect(post.userId).toEqual(user.id);
        }
    };

    it('should validate a single user', async () => {
        const user = await UserRepository.make().findOneBy({ id: Not(IsNull()) });
        await user.loadRelation('posts');
        assertSingle(user);
    });

    it('should validate multiple users', async () => {
        const users = await UserRepository.make().find({ take: 5 });
        await users.loadRelation('posts');
        for (const user of users) {
            assertSingle(user);
        }
    });

    it('should validate user pagination', async () => {
        let pagination = await UserRepository.make().pagination({}, { page: 1, perPage: 10 });
        await pagination.loadRelation('posts');
        for (const user of pagination.items) {
            assertSingle(user);
        }
    });
});
