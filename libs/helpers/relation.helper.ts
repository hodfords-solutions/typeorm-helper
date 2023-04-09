import { concat, Dictionary, get, groupBy, last, orderBy } from 'lodash';
import { RelationParams } from '../helper';
import { RelationGroupType } from '../types/relation-group.type';

export function getEntities(entities) {
    return Array.isArray(entities) ? entities : [entities];
}

export function getChildEntitiesAndRelationName(entities: any[], relationName: string) {
    let relationPaths = relationName.split('.');
    let relationPath = relationPaths.slice(0, -1).join('.');
    let childEntities = entities
        .map((entity) => get(entity, relationPath))
        .filter((value) => {
            if (!value) {
                return false;
            }
            return Array.isArray(value) ? value.length : true;
        });
    let newEntities = [];
    for (let entity of childEntities) {
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

export function groupRelationName(relationNames: RelationParams): Dictionary<RelationGroupType[]>{
    let relations: RelationGroupType[] = [];
    for (let relationName of relationNames){
        if (typeof relationName === 'string') {
            relations.push({
                level: relationName.split('.').length,
                name: relationName
            })
        } else {
            let key = Object.keys(relationName)[0];
            relations.push({
                level: key.split('.').length,
                name: key,
                customQuery: relationName[key]
            })
        }
    }
    return groupBy(orderBy(relations, 'level'), 'level');
}