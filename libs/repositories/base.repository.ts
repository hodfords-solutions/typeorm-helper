import {
    DeepPartial,
    EntityNotFoundError,
    FindConditions,
    FindManyOptions,
    getConnection,
    ObjectID,
    ObjectLiteral,
    Repository,
    SelectQueryBuilder,
    UpdateResult
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FindOneOptions } from 'typeorm/browser';
import { ObjectType } from 'typeorm/common/ObjectType';
import { PaginationCollection } from '../collections/pagination.collection';
import { EntityCollection } from '../collections/entity.collection';
import { BaseQuery } from '../queries/base.query';

export abstract class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    static make<T>(this: ObjectType<T>): T {
        return getConnection().getCustomRepository(this) as any;
    }

    async createOne(entity: QueryDeepPartialEntity<Entity>) {
        let data = await super.insert(entity);
        return await this.findById(data.identifiers[0].id);
    }

    async findById(id: string | number, options?: FindOneOptions<Entity>) {
        if (!id) {
            throw new Error('Id can not null');
        }
        return await super.findOneOrFail(id, options);
    }

    async pagination(
        options: FindManyOptions<Entity> | FindConditions<Entity> | SelectQueryBuilder<Entity> | BaseQuery<Entity>,
        paginationParams: { page?: number; perPage?: number }
    ) {
        let page = paginationParams.page || 1;
        let limit = paginationParams.perPage;

        if (options instanceof BaseQuery) {
            return this.paginateQueryBuilder(await this.applyQueryBuilder(options), { page: page, limit: limit });
        }

        if (options instanceof SelectQueryBuilder) {
            return this.paginateQueryBuilder(options, { page: page, limit: limit });
        }

        if (!options) {
            options = {};
        }
        let count = await super.count(options);
        let query: any = {};
        if (!options.where) {
            query.where = options;
        } else {
            query = options;
        }
        let items: any[] | Entity = await super.find({
            ...query,
            take: limit,
            skip: (page - 1) * limit
        });

        return new PaginationCollection<Entity>({
            items: items,
            total: count,
            lastPage: Math.ceil(count / limit),
            perPage: limit,
            currentPage: page
        });
    }

    private async paginateQueryBuilder(query: SelectQueryBuilder<Entity>, options) {
        const [items, total] = await query
            .take(options.limit)
            .skip((options.page - 1) * options.limit)
            .getManyAndCount();
        return new PaginationCollection<Entity>({
            items: items,
            total: total,
            lastPage: Math.ceil(total / options.limit),
            perPage: options.limit,
            currentPage: options.page
        });
    }

    async firstOrCreate(options: QueryDeepPartialEntity<Entity>) {
        let item = await super.findOne(options);
        if (!item) {
            return await this.createOne(options);
        }
        return item;
    }

    private async applyQueryBuilder(query: BaseQuery<Entity>) {
        let queryBuilder = this.createQueryBuilder(query.alias());
        await query.query(queryBuilder);
        await query.order(queryBuilder);
        return queryBuilder;
    }

    find(options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

    find(conditions?: FindConditions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>>;

    async find(optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>> {
        if (optionsOrConditions instanceof BaseQuery) {
            return (await this.applyQueryBuilder(optionsOrConditions)).getMany();
        }
        return (await super.find(optionsOrConditions)) as any;
    }

    findOne(
        id?: string | number | Date | ObjectID,
        options?: FindOneOptions<Entity> | BaseQuery<Entity>
    ): Promise<Entity | undefined>;

    findOne(options?: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity | undefined>;

    findOne(conditions?: FindConditions<Entity> | BaseQuery<Entity>, options?: FindOneOptions<Entity>): Promise<Entity | undefined>;

    async findOne(optionsOrConditions?: string | number | Date | ObjectID | FindOneOptions<Entity> | FindConditions<Entity> | BaseQuery<Entity>, maybeOptions?: FindOneOptions<Entity>): Promise<Entity | undefined> {
        if (optionsOrConditions instanceof BaseQuery) {
            return (await this.applyQueryBuilder(optionsOrConditions)).limit(1).getOne();
        }
        return (await super.findOne(optionsOrConditions, maybeOptions)) as any;
    }

    findOneOrFail(id?: string | number | Date | ObjectID, options?: FindOneOptions<Entity>): Promise<Entity>;

    findOneOrFail(options?: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity>;

    findOneOrFail(conditions?: FindConditions<Entity> | BaseQuery<Entity>, options?: FindOneOptions<Entity>): Promise<Entity>;

    async findOneOrFail(optionsOrConditions?: string | number | Date | ObjectID | FindOneOptions<Entity> | FindConditions<Entity> | BaseQuery<Entity>, maybeOptions?: FindOneOptions<Entity>): Promise<Entity> {
        if (optionsOrConditions instanceof BaseQuery) {
            return (await this.applyQueryBuilder(optionsOrConditions)).limit(1).getOneOrFail();
        }

        return (await super.findOneOrFail(optionsOrConditions, maybeOptions)) as any;
    }

    findAndCount(options?: FindManyOptions<Entity>): Promise<[EntityCollection<Entity>, number]>;

    findAndCount(conditions?: FindConditions<Entity> | BaseQuery<Entity>): Promise<[EntityCollection<Entity>, number]>;

    async findAndCount(optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity> | BaseQuery<Entity>): Promise<[EntityCollection<Entity>, number]> {
        if (optionsOrConditions instanceof BaseQuery) {
            return (await this.applyQueryBuilder(optionsOrConditions)).getManyAndCount();
        }

        return (await super.findAndCount(optionsOrConditions)) as any;
    }

    count(options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<number>;

    count(conditions?: FindConditions<Entity> | BaseQuery<Entity>): Promise<number>;

    async count(optionsOrConditions?: FindManyOptions<Entity> | FindConditions<Entity> | BaseQuery<Entity>): Promise<number> {
        if (optionsOrConditions instanceof BaseQuery) {
            return (await this.applyQueryBuilder(optionsOrConditions)).getCount();
        }
        return await super.count(optionsOrConditions);
    }


    /**
     * Must use this method inside transaction for deleting multiple entities
     */
    async deleteOrFail(criteria: FindConditions<Entity>) {
        const recordCount = await this.count(criteria);
        const queryResult = await this.delete(criteria);

        if (queryResult.affected === 0 || queryResult.affected !== recordCount) {
            throw new EntityNotFoundError(this.metadata.target, criteria);
        }

        return queryResult;
    }

    /**
     * Must use this method inside transaction for soft deleting multiple entities
     */
    async softDeleteOrFail(criteria: FindConditions<Entity>) {
        const recordCount = await this.count(criteria);
        const queryResult = await this.softDelete(criteria);

        if (queryResult.affected === 0 || queryResult.affected !== recordCount) {
            throw new EntityNotFoundError(this.metadata.target, criteria);
        }

        return queryResult;
    }

    /**
     * Must use this method inside transaction for update multiple entities
     */
    async updateOrFail(criteria: string | FindConditions<Entity>, partialEntity: DeepPartial<Entity>): Promise<UpdateResult> {
        const recordCount = await this.count(criteria);
        const queryResult = await this.update(criteria, partialEntity);

        if (queryResult.affected === 0 || queryResult.affected !== recordCount) {
            throw new EntityNotFoundError(this.metadata.target, criteria);
        }

        return queryResult;
    }

    async existOrFail(criteria: string | FindConditions<Entity>): Promise<boolean> {
        return Boolean(await this.findOneOrFail(criteria, { select: ['id'] }));
    }

    async exists(conditions?: FindConditions<Entity> | BaseQuery<Entity>) {
        return Boolean(await this.findOne(conditions, { select: ['id'] }));
    }
}
