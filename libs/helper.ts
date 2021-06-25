import { RelationQueryBuilder } from './query-builders/relation.query-builder';
import { SelectQueryBuilder } from 'typeorm';

export type RelationParams =
    string
    | string[]
    | (string | { [key: string]: (name: SelectQueryBuilder<any>) => void })[];

export async function loadRelations(entities, relationNames: RelationParams) {
    if (!entities) {
        return;
    }
    entities = Array.isArray(entities) ? entities : [entities];
    if (!entities.length) {
        return;
    }
    if (typeof relationNames === 'string') {
        await new RelationQueryBuilder(entities, relationNames).load();
    } else {
        for (let relationName of relationNames) {
            if (typeof relationName === 'string') {
                await new RelationQueryBuilder(entities, relationName).load();
            } else {
                let key = Object.keys(relationName)[0];
                let relationQueryBuilder = new RelationQueryBuilder(entities, key);
                relationQueryBuilder.addCustomQuery(relationName[key]);
                await relationQueryBuilder.load();
            }
        }
    }
}
