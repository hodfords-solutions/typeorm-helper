import { getMetadataArgsStorage, SelectQueryBuilder } from 'typeorm';

export function RelationCondition<T>(query: (query: SelectQueryBuilder<any>) => void, map?: any): PropertyDecorator {
    return function(object: Object, propertyName: string) {
        let metadataArgsStorage: any = getMetadataArgsStorage();
        if (metadataArgsStorage) {
            metadataArgsStorage.relationConditions = [];
        }
        metadataArgsStorage.relationConditions.push({
            target: object.constructor,
            propertyName: propertyName,
            options: { query, map }
        } as any);
    };
}
