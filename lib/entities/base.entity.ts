import { BaseEntity as AbstractEntity } from 'typeorm';
import { loadRelations, RelationParams } from '../helper';

export abstract class BaseEntity extends AbstractEntity {
    async loadRelation(relationNames: RelationParams, columns?: string[]): Promise<this> {
        await loadRelations(this, relationNames, columns);
        return this;
    }
}
