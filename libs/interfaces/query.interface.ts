import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface QueryInterface<Entity extends ObjectLiteral> {
    query(query: SelectQueryBuilder<Entity>);

    order?(query: SelectQueryBuilder<Entity>): void;

    alias?(): string;
}
