import { CustomRepository, BaseRepository } from '@hodfords/typeorm-helper';
import { PostEntity } from '../entities/post.entity';

@CustomRepository(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {}
