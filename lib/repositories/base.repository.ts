import {
    EntityManager,
    EntityNotFoundError,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    In,
    InsertResult,
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
    async runOnMaster<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
        const queryRunner = this.manager.dataSource.createQueryRunner('master');
        try {
            return await callback(queryRunner.manager);
        } finally {
            await queryRunner.release();
        }
    }

    static make<T>(this: new (...args: any[]) => T): T {
        const entity = Reflect.getMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, this);
        const baseRepository = getDataSource().getRepository(entity);
        return new this(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
    }

    async createOne(entity: QueryDeepPartialEntity<Entity>): Promise<Entity> {
        const result: InsertResult = await this.createQueryBuilder()
            .insert()
            .into(this.metadata.target)
            .values(entity)
            .returning('*')
            .execute();

        return this.runOnMaster(async (manager) => {
            return manager.findOneOrFail(this.metadata.target, {
                where: { id: result.identifiers[0].id } as any
            });
        });
    }

    async findById(id: string | number, options?: FindOneOptions<Entity>): Promise<Entity> {
        if (!id) {
            throw new Error('Id can not null');
        }
        return super.findOneOrFail({ where: { id } as any, ...options });
    }

    async findByIds(ids: (string | number)[], options?: FindManyOptions<Entity>): Promise<EntityCollection<Entity>> {
        if (!ids || ids.length === 0) {
            return [] as EntityCollection<Entity>;
        }
        return super.find({
            where: { id: In(ids) } as any,
            ...options
        });
    }

    async pagination(
        options: FindManyOptions<Entity> | FindOptionsWhere<Entity> | SelectQueryBuilder<Entity> | BaseQuery<Entity>,
        paginationOptions: PaginationOptions
    ): Promise<PaginationCollection<Entity>> {
        if (options instanceof BaseQuery) {
            return this.paginateQueryBuilder(this.applyQueryBuilder(options), paginationOptions);
        }

        if (options instanceof SelectQueryBuilder) {
            return this.paginateQueryBuilder(options, paginationOptions);
        }

        if (!options) {
            options = {};
        }

        const query: ObjectLiteral = options.where ? options : { where: options };
        const { page = 1, perPage } = paginationOptions;
        const [itemCount, items] = await Promise.all([
            super.count(options),
            super.find({
                ...query,
                take: perPage,
                skip: (page - 1) * perPage
            })
        ]);

        return new PaginationCollection<Entity>({
            items: items,
            total: itemCount,
            lastPage: Math.ceil(itemCount / perPage),
            perPage: perPage,
            currentPage: page
        });
    }

    private async paginateQueryBuilder(
        query: SelectQueryBuilder<Entity>,
        options: PaginationOptions
    ): Promise<PaginationCollection<Entity>> {
        const { page = 1, perPage } = options;
        const [items, itemCount] = await query
            .take(perPage)
            .skip((page - 1) * perPage)
            .getManyAndCount();
        return new PaginationCollection<Entity>({
            items: items,
            total: itemCount,
            lastPage: Math.ceil(itemCount / perPage),
            perPage: perPage,
            currentPage: options.page
        });
    }

    async firstOrCreate(options: QueryDeepPartialEntity<Entity>) {
        const item = await this.runOnMaster((manager) =>
            manager.findOne(this.metadata.target, {
                where: options as NodeJS.Dict<any>
            })
        );

        if (item) {
            return item;
        }

        return await this.createOne(options);
    }

    private applyQueryBuilder(query: BaseQuery<Entity>): SelectQueryBuilder<Entity> {
        const queryBuilder = this.createQueryBuilder(query.alias());
        query.query(queryBuilder);
        query.order(queryBuilder);
        return queryBuilder;
    }

    async find(options?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<EntityCollection<Entity>> {
        if (options instanceof BaseQuery) {
            const queryBuilder = this.applyQueryBuilder(options);
            return queryBuilder.getMany();
        }
        return super.find(options);
    }

    async findOne(options: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity | null> {
        if (options instanceof BaseQuery) {
            const queryBuilder = this.applyQueryBuilder(options);
            return queryBuilder.limit(1).getOne();
        }
        return super.findOne(options);
    }

    async findOneOrFail(options: FindOneOptions<Entity> | BaseQuery<Entity>): Promise<Entity> {
        if (options instanceof BaseQuery) {
            const queryBuilder = this.applyQueryBuilder(options);
            return queryBuilder.limit(1).getOneOrFail();
        }
        return super.findOneOrFail(options);
    }

    async findAndCount(
        options?: FindManyOptions<Entity> | BaseQuery<Entity>
    ): Promise<[EntityCollection<Entity>, number]> {
        if (options instanceof BaseQuery) {
            const queryBuilder = this.applyQueryBuilder(options);
            return queryBuilder.getManyAndCount();
        }
        return super.findAndCount(options);
    }

    async count(optionsOrConditions?: FindManyOptions<Entity> | BaseQuery<Entity>): Promise<number> {
        if (optionsOrConditions instanceof BaseQuery) {
            const queryBuilder = this.applyQueryBuilder(optionsOrConditions);
            return queryBuilder.getCount();
        }
        return await super.count(optionsOrConditions);
    }

    /**
     * Must use this method inside transaction for deleting multiple entities
     */
    async deleteOrFail(criteria: FindOptionsWhere<Entity>) {
        return this.runOnMaster(async (manager) => {
            const recordCount = await manager.count(this.metadata.target, { where: criteria });
            const deleteResult = await manager.delete(this.metadata.target, criteria);

            if (deleteResult.affected === 0 || deleteResult.affected !== recordCount) {
                throw new EntityNotFoundError(this.metadata.target, criteria);
            }

            return deleteResult;
        });
    }

    /**
     * Must use this method inside transaction for soft deleting multiple entities
     */
    async softDeleteOrFail(criteria: FindOptionsWhere<Entity>) {
        const recordCount = await this.count({ where: criteria });
        const deleteResult = await this.softDelete(criteria);

        if (deleteResult.affected === 0 || deleteResult.affected !== recordCount) {
            throw new EntityNotFoundError(this.metadata.target, criteria);
        }

        return deleteResult;
    }

    /**
     * Must use this method inside transaction for update multiple entities
     */
    async updateOrFail(
        criteria: FindOptionsWhere<Entity>,
        partialEntity: QueryDeepPartialEntity<Entity>
    ): Promise<UpdateResult> {
        return this.runOnMaster(async (manager) => {
            const recordCount = await manager.count(this.metadata.target, { where: criteria });
            const updateResult = await manager.update(this.metadata.target, criteria, partialEntity);

            if (updateResult.affected === 0 || updateResult.affected !== recordCount) {
                throw new EntityNotFoundError(this.metadata.target, criteria);
            }
            return updateResult;
        });
    }

    async existOrFail(criteria: FindOptionsWhere<Entity>): Promise<boolean> {
        const record = await this.findOneOrFail({ where: criteria, select: { id: true } as any });
        return Boolean(record);
    }
}
