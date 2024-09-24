/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { EntityMetadataBuilder } from 'typeorm/metadata-builder/EntityMetadataBuilder';
import { RelationConditionInterface } from '../interfaces/relation-condition.interface';

declare module 'typeorm/metadata-args/MetadataArgsStorage' {
    interface MetadataArgsStorage {
        relationConditions: RelationConditionInterface[];
    }
}

(EntityMetadataBuilder.prototype as any).buildOrigin = (EntityMetadataBuilder.prototype as any).build;
(EntityMetadataBuilder.prototype as any).build = function (entityClasses?: Function[]) {
    const entityMetadatas = this.buildOrigin(entityClasses);
    entityMetadatas.forEach((entityMetadata) => {
        if (this.metadataArgsStorage.relationConditions) {
            entityMetadata.relationConditions = this.metadataArgsStorage.relationConditions.filter(
                (custom) => custom.target === entityMetadata.target
            );
        } else {
            entityMetadata.relationConditions = [];
        }
    });
    return entityMetadatas;
};
