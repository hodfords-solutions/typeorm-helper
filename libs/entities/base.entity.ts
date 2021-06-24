import { BaseEntity as AbstractEntity } from 'typeorm';
import { RelationQueryBuilder } from '../query-builders/relation.query-builder';

export abstract class BaseEntity extends AbstractEntity {
    async loadRelation(relationName) {
        await new RelationQueryBuilder(this, relationName).load();
    }
}
