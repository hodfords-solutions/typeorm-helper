import { FindConditions, FindManyOptions, ObjectLiteral } from 'typeorm';
import { EntityCollection } from '../collections/entity.collection';
import { Repository } from 'typeorm/repository/Repository';

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
declare module 'typeorm/repository/MongoRepository' {
    interface MongoRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
        find(options?: FindManyOptions<Entity>): Promise<EntityCollection<Entity>>;

        find(conditions?: FindConditions<Entity>): Promise<EntityCollection<Entity>>;

        findAndCount(options?: FindManyOptions<Entity>): Promise<[EntityCollection<Entity>, number]>;

        findAndCount(conditions?: FindConditions<Entity>): Promise<[EntityCollection<Entity>, number]>;

        findByIds(ids: any[], options?: FindManyOptions<Entity>): Promise<EntityCollection<Entity>>;

        findByIds(ids: any[], conditions?: FindConditions<Entity>): Promise<EntityCollection<Entity>>;
    }
}
