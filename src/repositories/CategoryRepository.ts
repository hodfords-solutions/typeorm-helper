import { BaseRepository } from '../../libs';
import { Post } from '../entity/Post';
import { EntityRepository } from 'typeorm';
import { Category } from '../entity/Category';

@EntityRepository(Category)
export class CategoryRepository extends BaseRepository<Category> {}
