import { getMetadataArgsStorage, SelectQueryBuilder } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { EntityCollection } from '../collections/entity.collection';

export function RelationCondition(
    query: (query: SelectQueryBuilder<any>, entities: any[]) => void,
    map?: (entity, result, column: ColumnMetadata) => boolean
): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        let type = Reflect.getMetadata('design:type', object, propertyName);
        let metadataArgsStorage = getMetadataArgsStorage();
        if (!metadataArgsStorage.relationConditions) {
            metadataArgsStorage.relationConditions = [];
        }
        metadataArgsStorage.relationConditions.push({
            target: object.constructor,
            propertyName: propertyName,
            options: { query, map },
            isArray: type === Array || type === EntityCollection
        });
    };
}
