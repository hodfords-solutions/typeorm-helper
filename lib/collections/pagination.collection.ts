import { RelationParams } from 'lib/helper';
import { EntityCollection } from './entity.collection';

export class PaginationCollection<Entity> {
    public items: EntityCollection<Entity>;
    public total: number = 0;
    public lastPage: number = 0;
    public perPage: number = 0;
    public currentPage: number = 0;

    constructor(data: { items: any[]; total: number; lastPage: number; perPage: number; currentPage: number }) {
        if (!(this.items instanceof EntityCollection)) {
            this.items = new EntityCollection<Entity>().collect(data.items);
        }
        this.total = data.total;
        this.lastPage = data.lastPage;
        this.perPage = data.perPage;
        this.currentPage = data.currentPage;
    }

    async loadRelation(relationParams: RelationParams, columns?: string[]): Promise<void> {
        await this.items.loadRelation(relationParams, columns);
    }
}
