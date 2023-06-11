import { SelectQueryBuilder } from 'typeorm';

export type RelationGroupType = {
    level: number;
    name: string;
    customQuery?: (name: SelectQueryBuilder<any>) => void;
};
