import { FindManyOptions, FindOneOptions, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { EntityCollection } from '../collections/entity.collection';
import { BaseQuery } from '../queries/base.query';

declare module 'typeorm/repository/Repository' {
    interface Repository<Entity extends ObjectLiteral> {
        find(conditions?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        findAndCount(
            options?: FindManyOptions<Entity> | BaseQuery<Entity>
        ): Promise<[EntityCollection<Entity>, number]>;

        findByIds(ids: any[], options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        findByIds(
            ids: any[],
            conditions?: FindOptionsWhere<Entity> | BaseQuery<Entity>
        ): Promise<EntityCollection<Entity>>;

        findOne(options: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity | null>;

        findOneOrFail(options: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity>;

        count(options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<number>;
    }
}
declare module 'typeorm/repository/MongoRepository' {
    interface MongoRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
        find(options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        findAndCount(
            options?: FindManyOptions<Entity> | BaseQuery<Entity>
        ): Promise<[EntityCollection<Entity>, number]>;

        findByIds(ids: any[], options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        findByIds(
            ids: any[],
            conditions?: FindOptionsWhere<Entity> | BaseQuery<Entity>
        ): Promise<EntityCollection<Entity>>;

        findOne(options: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity | null>;

        findOneOrFail(options: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity>;
    }
}
