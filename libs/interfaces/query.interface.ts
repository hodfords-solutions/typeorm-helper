import { SelectQueryBuilder, WhereExpression } from 'typeorm';

export interface QueryInterface<Entity> {
    query(query: SelectQueryBuilder<Entity>);

    order?(query: SelectQueryBuilder<Entity>): void;

    alias?(): string;
}
