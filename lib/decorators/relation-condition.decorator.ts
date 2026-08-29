import { getMetadataArgsStorage, SelectQueryBuilder } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';
import { EntityCollection } from '../collections/entity.collection.js';

export function RelationCondition(
    query: (query: SelectQueryBuilder<any>, entities: any[]) => void,
    map?: (entity: any, result: any, column: ColumnMetadata) => boolean
): PropertyDecorator {
    return function (object: object, propertyName: string | symbol) {
        const type = Reflect.getMetadata('design:type', object, propertyName);
        const metadataArgsStorage = getMetadataArgsStorage();
        if (!metadataArgsStorage.relationConditions) {
            metadataArgsStorage.relationConditions = [];
        }
        metadataArgsStorage.relationConditions.push({
            target: object.constructor,
            propertyName: propertyName as string,
            options: { query, map },
            isArray: type === Array || type === EntityCollection
        });
    };
}
