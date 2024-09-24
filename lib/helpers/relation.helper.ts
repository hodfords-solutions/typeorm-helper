import { concat, get, groupBy, last, orderBy } from 'lodash';
import { RelationParams } from '../helper';
import { SelectQueryBuilder } from 'typeorm';

export type RelationGroupType = {
    level: number;
    name: string;
    customQuery?: (name: SelectQueryBuilder<any>) => void;
};

export function getEntities<T>(entities: T | T[]): T[] {
    return Array.isArray(entities) ? entities : [entities];
}

export function getEntitiesByPaths(entities: any[], relationPaths: string[], index: number = 0) {
    let childEntities = [];
    for (const entity of entities) {
        const childEntity = get(entity, relationPaths[index]);
        if (!childEntity) {
            continue;
        }
        if (Array.isArray(childEntity)) {
            if (childEntity.length) {
                childEntities = childEntities.concat(childEntity);
            }
        } else {
            childEntities.push(childEntity);
        }
    }
    if (index < relationPaths.length - 1) {
        return getEntitiesByPaths(childEntities, relationPaths, index + 1);
    }
    return childEntities;
}

export function getChildEntitiesAndRelationName(entities: any[], relationName: string) {
    const relationPaths = relationName.split('.');
    const childEntities = getEntitiesByPaths(entities, relationPaths.slice(0, -1));
    let newEntities = [];
    for (const entity of childEntities) {
        if (Array.isArray(entity)) {
            newEntities = concat(newEntities, ...entity);
        } else {
            newEntities.push(entity);
        }
    }
    return {
        entities: newEntities,
        relationName: last(relationPaths)
    };
}

export function groupRelationName(relationNames: RelationParams): Record<string, RelationGroupType[]> {
    const relations: RelationGroupType[] = [];
    for (const relationName of relationNames) {
        if (typeof relationName === 'string') {
            relations.push({
                level: relationName.split('.').length,
                name: relationName
            });
        } else {
            const key = Object.keys(relationName)[0];
            relations.push({
                level: key.split('.').length,
                name: key,
                customQuery: relationName[key]
            });
        }
    }
    return groupBy(orderBy(relations, 'level'), 'level');
}
