import { FindConditions, FindManyOptions, ObjectLiteral } from 'typeorm';
import { EntityCollection } from '../collections/entity.collection';
import { Repository } from 'typeorm/repository/Repository';
import { BaseQuery } from '../queries/base.query';
import { ObjectID } from 'typeorm/driver/mongodb/typings';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

declare module 'typeorm/repository/Repository' {
    interface Repository<Entity extends ObjectLiteral> {
        find(options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        find(conditions?: FindConditions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        findAndCount(
            options?: FindManyOptions<Entity> | BaseQuery<Entity>
        ): Promise<[EntityCollection<Entity>, number]>;

        findAndCount(
            conditions?: FindConditions<Entity> | BaseQuery<Entity>
        ): Promise<[EntityCollection<Entity>, number]>;

        findByIds(ids: any[], options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        findByIds(
            ids: any[],
            conditions?: FindConditions<Entity> | BaseQuery<Entity>
        ): Promise<EntityCollection<Entity>>;

        findOne(
            id?: string | number | Date | ObjectID,
            options?: FindOneOptions<Entity> | BaseQuery<Entity>
        ): Promise<Entity | undefined>;

        findOne(options?: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity | undefined>;

        findOne(
            conditions?: FindConditions<Entity> | BaseQuery<Entity>,
            options?: FindOneOptions<Entity>
        ): Promise<Entity | undefined>;

        findOneOrFail(id?: string | number | Date | ObjectID, options?: FindOneOptions<Entity>): Promise<Entity>;

        findOneOrFail(options?: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity>;

        findOneOrFail(
            conditions?: FindConditions<Entity> | BaseQuery<Entity>,
            options?: FindOneOptions<Entity>
        ): Promise<Entity>;

        count(options?: FindManyOptions<Entity>): Promise<number>;

        count(conditions?: FindConditions<Entity> | BaseQuery<Entity>): Promise<number>;
    }
}
declare module 'typeorm/repository/MongoRepository' {
    interface MongoRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
        find(options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        find(conditions?: FindConditions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        findAndCount(
            options?: FindManyOptions<Entity> | BaseQuery<Entity>
        ): Promise<[EntityCollection<Entity>, number]>;

        findAndCount(
            conditions?: FindConditions<Entity> | BaseQuery<Entity>
        ): Promise<[EntityCollection<Entity>, number]>;

        findByIds(ids: any[], options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

        findByIds(
            ids: any[],
            conditions?: FindConditions<Entity> | BaseQuery<Entity>
        ): Promise<EntityCollection<Entity>>;

        findOne(
            id?: string | number | Date | ObjectID,
            options?: FindOneOptions<Entity> | BaseQuery<Entity>
        ): Promise<Entity | undefined>;

        findOne(options?: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity | undefined>;

        findOne(
            conditions?: FindConditions<Entity> | BaseQuery<Entity>,
            options?: FindOneOptions<Entity>
        ): Promise<Entity | undefined>;

        findOneOrFail(id?: string | number | Date | ObjectID, options?: FindOneOptions<Entity>): Promise<Entity>;

        findOneOrFail(options?: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity>;

        findOneOrFail(
            conditions?: FindConditions<Entity> | BaseQuery<Entity>,
            options?: FindOneOptions<Entity>
        ): Promise<Entity>;
    }
}
