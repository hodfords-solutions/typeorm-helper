import { BaseRepository } from '../../libs';
import { Post } from '../entity/Post';
import { EntityRepository } from 'typeorm';

@EntityRepository(Post)
export class PostRepository extends BaseRepository<Post> {}
