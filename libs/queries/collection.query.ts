import { SelectQueryBuilder } from 'typeorm';
import { BaseQuery } from './base.query';
import { QueryInterface } from '../interfaces/query.interface';

export class CollectionQuery<Entity> extends BaseQuery<Entity> {
    public constructor(private queries: QueryInterface<Entity>[]) {
        super();
    }

    query(query: SelectQueryBuilder<Entity>) {
        for (let queryBuilder of this.queries) {
            queryBuilder.query(query);
        }
    }
}
