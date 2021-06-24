import {BaseRepository} from '../../libs';
import {Post} from '../entity/Post';
import {EntityRepository} from 'typeorm';
import {User} from '../entity/User';

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {
}
