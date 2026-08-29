/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { SelectQueryBuilder } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata.js';

export interface RelationConditionInterface {
    target: Function | string;
    propertyName: string;
    isArray: boolean;
    options: {
        query?: (query: SelectQueryBuilder<any>, entities: any[]) => void;
        map?: (entity: any, result: any, column: ColumnMetadata) => boolean;
    };
}
