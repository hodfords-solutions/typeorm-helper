import { CustomRepository } from '../../lib/decorators/custom-repository.decorator.js';
import { BaseRepository } from '../../lib/repositories/base.repository.js';
import { TagEntity } from '../entities/tag.entity.js';

@CustomRepository(TagEntity)
export class TagRepository extends BaseRepository<TagEntity> {
    findByName(name: string): Promise<TagEntity | null> {
        return this.findOne({ where: { name } });
    }
}
