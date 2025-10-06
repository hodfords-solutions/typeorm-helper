import { UserRepository } from '../sample/repositories/user.repository';
import { initializeTest } from './test-helper';

describe('Insert Query Builder Test Cases', () => {
    beforeAll(async () => {
        await initializeTest();
    });

    it('Should return entity instance and applied all transformers', async () => {
        const user = await UserRepository.make().createOne({ name: 'Test User' });
        expect(typeof user.createdAt).toBe('number');
    });
});
