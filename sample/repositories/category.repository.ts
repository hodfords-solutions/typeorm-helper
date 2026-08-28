import { CustomRepository, BaseRepository } from '@hodfords/typeorm-helper';
import { CategoryEntity } from '../entities/category.entity.js';

@CustomRepository(CategoryEntity)
export class CategoryRepository extends BaseRepository<CategoryEntity> {}
