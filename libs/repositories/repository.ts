import { FindConditions, FindManyOptions, ObjectLiteral } from 'typeorm';
import { EntityCollection } from '../collections/entity.collection';

declare module 'typeorm/repository/Repository' {
    interface Repository<Entity extends ObjectLiteral> {
        find(options?: FindManyOptions<Entity>): Promise<EntityCollection<Entity>>;

        find(conditions?: FindConditions<Entity>): Promise<EntityCollection<Entity>>;

        findAndCount(options?: FindManyOptions<Entity>): Promise<[EntityCollection<Entity>, number]>;

        findAndCount(conditions?: FindConditions<Entity>): Promise<[EntityCollection<Entity>, number]>;

        findByIds(ids: any[], options?: FindManyOptions<Entity>): Promise<EntityCollection<Entity>>;

        findByIds(ids: any[], conditions?: FindConditions<Entity>): Promise<EntityCollection<Entity>>;
    }
}
