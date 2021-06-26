import { loadRelations, RelationParams } from '../helper';

export class EntityCollection<Entity> extends Array<Entity> {
    public collect(entities: Entity[]): EntityCollection<Entity> {
        entities.forEach((entity) => this.push(entity));
        return this;
    }

    async loadRelation(relationNames: RelationParams) {
        await loadRelations(this, relationNames);
        return this;
    }
}
