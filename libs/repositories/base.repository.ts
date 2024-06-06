import {
    EntityNotFoundError,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    ObjectLiteral,
    Repository,
    SelectQueryBuilder,
    UpdateResult
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { EntityCollection } from '../collections/entity.collection';
import { PaginationCollection } from '../collections/pagination.collection';
import { getDataSource } from '../containers/data-source-container';
import { TYPEORM_EX_CUSTOM_REPOSITORY } from '../decorators/custom-repository.decorator';
import { BaseQuery } from '../queries/base.query';
import { PaginationOptions } from '../types/pagination-options.type';

export abstract class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    static make<T>(this: new (...args: any[]) => T): T {
        const entity = Reflect.getMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, this);
        const baseRepository = getDataSource().getRepository(entity);

        return new this(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
    }

    async createOne(entity: QueryDeepPartialEntity<Entity>) {
        let data = await super.insert(entity);
        return await this.findById(data.identifiers[0].id);
    }

    async findById(id: string | number, options?: FindOneOptions<Entity>) {
        if (!id) {
            throw new Error('Id can not null');
        }
        return await super.findOneOrFail({
            where: {
                id
            } as any,
            ...options
        });
    }

    async pagination(
        options: FindManyOptions<Entity> | FindOptionsWhere<Entity> | SelectQueryBuilder<Entity> | BaseQuery<Entity>,
        paginationParams: PaginationOptions
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
        query.order(queryBuilder);
        return queryBuilder;
    }

    async find(options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>> {
        if (options instanceof BaseQuery) {
            return (await this.applyQueryBuilder(options)).getMany();
        }
        return (await super.find(options)) as any;
    }

    async findOne(options: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity | null> {
        if (options instanceof BaseQuery) {
            return (await this.applyQueryBuilder(options)).limit(1).getOne();
        }

        return (await super.findOne(options)) as any;
    }

    async findOneOrFail(options: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity> {
        if (options instanceof BaseQuery) {
            return (await this.applyQueryBuilder(options)).limit(1).getOneOrFail();
        }

        return (await super.findOneOrFail(options)) as any;
    }

    async findAndCount(
        options?: FindManyOptions<Entity> | BaseQuery<Entity>
    ): Promise<[EntityCollection<Entity>, number]> {
        if (options instanceof BaseQuery) {
            return (await this.applyQueryBuilder(options)).getManyAndCount();
        }

        return (await super.findAndCount(options)) as any;
    }

    async count(optionsOrConditions?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<number> {
        if (optionsOrConditions instanceof BaseQuery) {
            return (await this.applyQueryBuilder(optionsOrConditions)).getCount();
        }
        return await super.count(optionsOrConditions);
    }

    /**
     * Must use this method inside transaction for deleting multiple entities
     */
    async deleteOrFail(criteria: FindOptionsWhere<Entity>) {
        const recordCount = await this.count({ where: criteria });
        const queryResult = await this.delete(criteria);

        if (queryResult.affected === 0 || queryResult.affected !== recordCount) {
            throw new EntityNotFoundError(this.metadata.target, criteria);
        }

        return queryResult;
    }

    /**
     * Must use this method inside transaction for soft deleting multiple entities
     */
    async softDeleteOrFail(criteria: FindOptionsWhere<Entity>) {
        const recordCount = await this.count({ where: criteria });
        const queryResult = await this.softDelete(criteria);

        if (queryResult.affected === 0 || queryResult.affected !== recordCount) {
            throw new EntityNotFoundError(this.metadata.target, criteria);
        }

        return queryResult;
    }

    /**
     * Must use this method inside transaction for update multiple entities
     */
    async updateOrFail(
        criteria: FindOptionsWhere<Entity>,
        partialEntity: QueryDeepPartialEntity<Entity>
    ): Promise<UpdateResult> {
        const recordCount = await this.count({ where: criteria });
        const queryResult = await this.update(criteria, partialEntity);

        if (queryResult.affected === 0 || queryResult.affected !== recordCount) {
            throw new EntityNotFoundError(this.metadata.target, criteria);
        }

        return queryResult;
    }

    async existOrFail(criteria: FindOptionsWhere<Entity>): Promise<boolean> {
        return Boolean(
            await this.findOneOrFail({
                where: criteria,
                select: {
                    id: true
                } as any
            })
        );
    }
}
