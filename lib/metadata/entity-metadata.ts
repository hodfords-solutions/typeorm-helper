import { RelationConditionInterface } from '../interfaces/relation-condition.interface.js';

declare module 'typeorm/metadata/EntityMetadata.js' {
    interface EntityMetadata {
        relationConditions: RelationConditionInterface[];
    }
}
