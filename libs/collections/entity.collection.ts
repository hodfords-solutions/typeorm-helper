import { RelationQueryBuilder } from '../query-builders/relation.query-builder';

export class EntityCollection<Entity> extends Array<Entity> {
    public collect(entities: Entity[]): EntityCollection<Entity> {
        entities.forEach((entity) => this.push(entity));
        return this;
    }

    async loadRelation(relationName: string) {
        await new RelationQueryBuilder(this, relationName).load();
        return this;
    }
}
