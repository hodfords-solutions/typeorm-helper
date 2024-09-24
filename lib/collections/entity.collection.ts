import { loadRelations, RelationParams } from '../helper';

export class EntityCollection<Entity> extends Array<Entity> {
    public collect(entities: Entity[]): EntityCollection<Entity> {
        entities.forEach((entity) => this.push(entity));
        return this;
    }

    async loadRelation(relationParams: RelationParams, columns?: string[]): Promise<this> {
        await loadRelations(this, relationParams, columns);
        return this;
    }
}
