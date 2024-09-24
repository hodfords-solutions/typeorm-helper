import { CustomRepository, BaseRepository } from '@hodfords/typeorm-helper';
import { UserEntity } from '../entities/user.entity';

@CustomRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {}
