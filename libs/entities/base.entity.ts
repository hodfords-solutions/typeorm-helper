import { BaseEntity as AbstractEntity } from 'typeorm';
import { loadRelations, RelationParams } from '../helper';

export abstract class BaseEntity extends AbstractEntity {
    async loadRelation(relationNames: RelationParams) {
        await loadRelations(this, relationNames);
        return this;
    }
}
