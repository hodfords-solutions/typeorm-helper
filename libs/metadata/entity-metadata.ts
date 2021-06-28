import { RelationConditionInterface } from '../interfaces/relation-condition.interface';

declare module 'typeorm/metadata/EntityMetadata' {
    interface EntityMetadata {
        relationConditions: RelationConditionInterface[];
    }
}
