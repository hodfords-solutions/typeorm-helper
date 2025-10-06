import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';

export function applyTransformers<Entity>(entityMetadata: any, entity: Entity, raw: any): Entity {
    for (const column of entityMetadata.columns as ColumnMetadata[]) {
        if (column.transformer && raw.hasOwnProperty(column.databaseName)) {
            const transformer = Array.isArray(column.transformer) ? column.transformer[0] : column.transformer;
            if (transformer && typeof transformer.from === 'function') {
                entity[column.propertyName] = transformer.from(raw[column.databaseName]);
            }
        }
    }
    return entity;
}
