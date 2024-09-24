import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { QueryInterface } from '../interfaces/query.interface';
import { BaseQuery } from './base.query';

export class CollectionQuery<Entity extends ObjectLiteral> extends BaseQuery<Entity> {
    public constructor(private queries: QueryInterface<Entity>[]) {
        super();
    }

    query(query: SelectQueryBuilder<Entity>): void {
        for (const queryBuilder of this.queries) {
            queryBuilder.query(query);
        }
    }
}
