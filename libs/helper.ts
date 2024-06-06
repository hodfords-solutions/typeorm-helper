import { RelationQueryBuilder } from './query-builders/relation.query-builder';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { WhereExpressionInterface } from './interfaces/where-expression.interface';
import { CollectionWhereExpression } from './where-expression/collection.where-expression';
import { QueryInterface } from './interfaces/query.interface';
import { CollectionQuery } from './queries/collection.query';
import { getChildEntitiesAndRelationName, getEntities, groupRelationName } from './helpers/relation.helper';

export type RelationParams =
    | string
    | string[]
    | (string | { [key: string]: (name: SelectQueryBuilder<any>) => void })[];
export async function loadRelations(entities, relationNames: RelationParams, columns?: string[]) {
    if (!entities) {
        return;
    }
    entities = getEntities(entities);
    if (!entities.length) {
        return;
    }
    if (typeof relationNames === 'string') {
        await loadRelation(entities, relationNames, columns);
    } else {
        let relationGroups = groupRelationName(relationNames);
        for (const relations of relationGroups) {
            await Promise.all(
                relations.map(async (relation) => {
                    await loadRelation(entities, relation.name, columns, relation.customQuery);
                })
            );
        }
    }
}

async function loadRelation(entities, relationName: string, columns?: string[], customQuery = null) {
    entities = getEntities(entities);
    if (relationName.includes('.')) {
        let childEntity = getChildEntitiesAndRelationName(entities, relationName);
        entities = childEntity.entities;
        relationName = childEntity.relationName;
        if (!entities.length) {
            return;
        }
    }
    let relationQueryBuilder = await new RelationQueryBuilder(entities, relationName);
    if (customQuery) {
        relationQueryBuilder.addCustomQuery(customQuery);
    }
    if (columns?.length) {
        columns = columns.map((column) => (column.includes('.') ? column : `${relationName}.${column}`));
        relationQueryBuilder.addCustomQuery((query: SelectQueryBuilder<any>) => {
            query.select(columns);
        });
    }
    await relationQueryBuilder.load();
}

export function collectExpression(whereExpressions: WhereExpressionInterface[]) {
    return new CollectionWhereExpression(whereExpressions);
}

export function collectQuery<Entity extends ObjectLiteral>(queries: QueryInterface<Entity>[]) {
    return new CollectionQuery(queries);
}
