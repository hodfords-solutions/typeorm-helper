import { EntityMetadataBuilder } from 'typeorm/metadata-builder/EntityMetadataBuilder';
import { RelationConditionInterface } from '../interfaces/relation-condition.interface';

declare module 'typeorm/metadata-args/MetadataArgsStorage' {
    interface MetadataArgsStorage {
        readonly relationConditions: RelationConditionInterface[];
    }
}

(EntityMetadataBuilder.prototype as any).buildOrigin = (EntityMetadataBuilder.prototype as any).build;
(EntityMetadataBuilder.prototype as any).build = function(entityClasses?: Function[]) {
    let entityMetadatas = this.buildOrigin(entityClasses);
    entityMetadatas.forEach(entityMetadata => {
        entityMetadata.relationConditions = this.metadataArgsStorage.relationConditions.filter((custom) => custom.target === entityMetadata.target);
    });
    return entityMetadatas;
};


