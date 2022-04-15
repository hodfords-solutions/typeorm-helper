import { RelationQueryBuilder } from './query-builders/relation.query-builder';
import { SelectQueryBuilder } from 'typeorm';
import { WhereExpressionInterface } from './interfaces/where-expression.interface';
import { CollectionWhereExpression } from './where-expression/collection.where-expression';
import { QueryInterface } from './interfaces/query.interface';
import { CollectionQuery } from './queries/collection.query';

export type RelationParams =
    | string
    | string[]
    | (string | { [key: string]: (name: SelectQueryBuilder<any>) => void })[];

export async function loadRelations(entities, relationNames: RelationParams, columns?: string[]) {
    if (!entities) {
        return;
    }
    entities = Array.isArray(entities) ? entities : [entities];
    if (!entities.length) {
        return;
    }
    if (typeof relationNames === 'string') {
        await loadRelation(entities, relationNames, columns);
    } else {
        for (let relationName of relationNames) {
            if (typeof relationName === 'string') {
                await loadRelation(entities, relationName, columns);
            } else {
                let key = Object.keys(relationName)[0];
                await loadRelation(entities, key, columns, relationName[key]);
            }
        }
    }
}

async function loadRelation(entities, relationName : string, columns?: string[], customQuery = null) {
    let relationQueryBuilder = await new RelationQueryBuilder(entities, relationName);
    if (customQuery) {
        relationQueryBuilder.addCustomQuery(customQuery);
    }
    if (columns?.length) {
        columns = columns.map((column) => column.includes('.') ? column : `${relationName}.${column}`);
        relationQueryBuilder.addCustomQuery((query: SelectQueryBuilder<any>) => {
            query.select(columns);
        });
    }
    await relationQueryBuilder.load();
}

export function collectExpression(whereExpressions: WhereExpressionInterface[]) {
    return new CollectionWhereExpression(whereExpressions);
}

export function collectQuery<Entity>(queries: QueryInterface<Entity>[]) {
    return new CollectionQuery(queries);
}
