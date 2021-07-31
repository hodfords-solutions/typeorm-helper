import { SelectQueryBuilder, WhereExpression } from 'typeorm';
import { QueryInterface } from '../interfaces/query.interface';

export abstract class BaseQuery<Entity> implements QueryInterface<Entity> {
    alias(): string {
        return undefined;
    }

    order(query: SelectQueryBuilder<Entity>): void {}

    abstract query(query: SelectQueryBuilder<Entity>);
}
