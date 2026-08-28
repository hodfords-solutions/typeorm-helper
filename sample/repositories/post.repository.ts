import { CustomRepository, BaseRepository } from '@hodfords/typeorm-helper';
import { PostEntity } from '../entities/post.entity.js';

@CustomRepository(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {}
