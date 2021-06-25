import { FindConditions, FindManyOptions, getConnection, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FindOneOptions } from 'typeorm/browser';
import { ObjectType } from 'typeorm/common/ObjectType';
import { PaginationCollection } from '../collections/pagination.collection';

export abstract class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    static make<T>(this: ObjectType<T>): T {
        return getConnection().getCustomRepository(this) as any;
    }

    async createOne(entity: QueryDeepPartialEntity<Entity>) {
        let data = await super.insert(entity);
        return await this.findById(data.identifiers[0].id);
    }

    async findById(id: string | number, options?: FindOneOptions<Entity>) {
        return await super.findOneOrFail(id, options);
    }

    async pagination(
        options: FindManyOptions<Entity> | FindConditions<Entity> | any | SelectQueryBuilder<Entity>,
        paginationParams: { page?: number; perPage?: number }
    ) {
        let page = paginationParams.page || 1;
        let limit = paginationParams.perPage;

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

    exists(conditions?: FindConditions<Entity>) {
        return !!this.findOne(conditions, { select: ['id'] });
    }
}
