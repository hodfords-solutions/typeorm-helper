import { CustomRepository, BaseRepository } from '@hodfords/typeorm-helper';
import { UserEntity } from '../entities/user.entity.js';

@CustomRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {}
