import { FindManyOptions, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { EntityCollection } from '../collections/entity.collection.js';
import type { FilterOperators } from 'typeorm/driver/mongodb/typings.js';

declare module 'typeorm/repository/MongoRepository.js' {
    interface MongoRepository<Entity extends ObjectLiteral> {
        find(
            options?: FindManyOptions<Entity> | Partial<Entity> | FilterOperators<Entity>
        ): Promise<EntityCollection<Entity>>;

        findAndCount(options?: FindManyOptions<Entity>): Promise<[EntityCollection<Entity>, number]>;

        findAndCount(conditions?: FindOptionsWhere<Entity>): Promise<[EntityCollection<Entity>, number]>;

        findByIds(ids: any[], options?: FindManyOptions<Entity>): Promise<EntityCollection<Entity>>;

        findByIds(ids: any[], conditions?: FindOptionsWhere<Entity>): Promise<EntityCollection<Entity>>;
    }
}
