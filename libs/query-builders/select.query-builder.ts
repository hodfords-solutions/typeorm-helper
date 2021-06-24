import { SelectQueryBuilder } from 'typeorm';
import { EntityCollection } from '../collections/entity.collection';

declare module 'typeorm/query-builder/SelectQueryBuilder' {
    interface SelectQueryBuilder<Entity> {
        getMany(): Promise<EntityCollection<Entity>>;

        getManyOrigin(): Promise<Entity[]>;

        getRawManyOrigin(): Promise<any[]>;

        getRawMany(): Promise<EntityCollection<any>>;

        getManyAndCountOrigin(): Promise<[Entity[], number]>;

        getManyAndCount(): Promise<[EntityCollection<Entity>, number]>;
    }
}
SelectQueryBuilder.prototype.getManyOrigin = SelectQueryBuilder.prototype.getMany;
SelectQueryBuilder.prototype.getMany = async function() {
    const results = await this.getManyOrigin();
    return new EntityCollection().collect(results);
};

SelectQueryBuilder.prototype.getRawManyOrigin = SelectQueryBuilder.prototype.getRawMany;
SelectQueryBuilder.prototype.getRawMany = async function() {
    const results = await this.getRawManyOrigin();
    return new EntityCollection().collect(results);
};

SelectQueryBuilder.prototype.getManyAndCountOrigin = SelectQueryBuilder.prototype.getManyAndCount;
SelectQueryBuilder.prototype.getManyAndCount = async function() {
    const [results, count] = await this.getManyAndCountOrigin();
    return [new EntityCollection().collect(results), count] as any;
};
