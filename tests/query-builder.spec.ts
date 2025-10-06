import { PostRepository } from '../sample/repositories/post.repository';
import { PostOfUserQuery } from '../sample/queries/post-of-user.query';
import { initializeTest } from './test-helper';
import { UserRepository } from '../sample/repositories/user.repository';
import { IsNull, Not } from 'typeorm';

describe('Query Builder Test Cases', () => {
    beforeAll(async () => {
        await initializeTest();
    });

    it('should return posts of a specific user by id', async () => {
        const user = await UserRepository.make().findOneBy({ id: Not(IsNull()) });
        await user.loadRelation('posts');

        const posts = await PostRepository.make().find(new PostOfUserQuery(user.id));
        for (const post of posts) {
            expect(post.userId).toEqual(user.id);
        }
    });

    it('should update the user or fail if not found', async () => {
        const userRepo = UserRepository.make();
        const user = await userRepo.save({ name: 'Old Name', email: 'test@example.com' });

        const result = await userRepo.updateOrFail({ id: user.id }, { name: 'New Name' });

        expect(result.affected).toBe(1);

        const updatedUser = await userRepo.findOneByOrFail({ id: user.id });
        expect(updatedUser.name).toBe('New Name');
    });

    it('should throw EntityNotFoundError when updating non-existent user', async () => {
        const userRepo = UserRepository.make();
        await expect(userRepo.updateOrFail({ id: -1 }, { name: 'No One' })).rejects.toThrow(
            'Could not find any entity'
        );
    });
});
