import { SelectQueryBuilder } from 'typeorm';

export interface RelationConditionInterface {
    target: Function | string;
    propertyName: string;
    options: {
        query?: (query: SelectQueryBuilder<any>) => void,
        map?: (query) => boolean
    };
}
