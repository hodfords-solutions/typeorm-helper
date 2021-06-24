import {uniq} from 'lodash';
import {Brackets, Connection, getConnection, ObjectLiteral, QueryRunner, SelectQueryBuilder} from 'typeorm';
import {RelationMetadata} from 'typeorm/metadata/RelationMetadata';

export class RelationQueryBuilder {
    public relation: RelationMetadata;
    private connection: Connection;
    private customQuery: (queryBuilder: SelectQueryBuilder<any>) => void;
    public results: any[];
    public entities: any[] = [];

    constructor(
        entityOrEntities: ObjectLiteral | ObjectLiteral[],
        private relationName: string,
        private queryRunner?: QueryRunner
    ) {
        if (queryRunner && !queryRunner.isReleased) {
            this.connection = queryRunner.connection;
        } else {
            this.queryRunner = undefined;
            this.connection = getConnection();
        }
        this.entities = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];
        let entity = this.connection.getMetadata(this.entities[0].constructor);
        this.relation = entity.relations.find((relation) => relation.propertyName === relationName);
    }

    async load() {
        if (this.relation.isManyToOne || this.relation.isOneToOneOwner) {
            this.results = await this.queryManyToOneOrOneToOneOwner();
        } else if (this.relation.isOneToMany || this.relation.isOneToOneNotOwner) {
            this.results = await this.queryOneToManyOrOneToOneNotOwner();
        } else if (this.relation.isManyToManyOwner) {
            throw new TypeError('Plz help us create it when you use loadManyToManyOwner');
        } else {
            throw new TypeError('Plz help us create it when you use loadManyToManyNotOwner');
        }
        this.assignData();
    }

    assignData() {
        if (this.relation.isManyToOne || this.relation.isOneToOneOwner) {
            return this.assignDataManyToOneOrOneToOneOwner();
        } else if (this.relation.isOneToMany || this.relation.isOneToOneNotOwner) {
            return this.assignOneToManyOrOneToOneNotOwner();
        } else if (this.relation.isManyToManyOwner) {
            throw new TypeError('Plz help us create it when you use loadManyToManyOwner');
        } else {
            throw new TypeError('Plz help us create it when you use loadManyToManyNotOwner');
        }
    }

    assignDataManyToOneOrOneToOneOwner() {
        for (let entity of this.entities) {
            entity[this.relationName] = this.results.find((result) => {
                for (let column of this.relation.joinColumns) {
                    if (entity[column.databaseName] !== result[column.referencedColumn.databaseName]) {
                        return false;
                    }
                }
                return true;
            });
        }
    }

    assignOneToManyOrOneToOneNotOwner() {
        for (let entity of this.entities) {
            entity[this.relationName] = this.results.filter((result) => {
                for (let column of this.inverseRelation.joinColumns) {
                    if (entity[column.referencedColumn.databaseName] !== result[column.databaseName]) {
                        return false;
                    }
                }
                return true;
            });
        }
    }

    addCustomQuery(customQuery: (name: SelectQueryBuilder<any>) => void) {
        this.customQuery = customQuery;
    }

    public get type() {
        return this.relation.type;
    }

    get inverseRelation() {
        return this.relation.inverseRelation;
    }

    getValues(column) {
        return uniq(this.entities.map((entity) => entity[column]));
    }

    queryOneToManyOrOneToOneNotOwner() {
        let queryBuilder = this.connection
            .createQueryBuilder(this.queryRunner)
            .select(this.relationName)
            .from(this.inverseRelation.entityMetadata.target, this.relationName);
        queryBuilder.where(
            new Brackets((query) => {
                for (let column of this.inverseRelation.joinColumns) {
                    query.where(` "${column.databaseName}" IN (:...values)`, {
                        values: this.getValues(column.referencedColumn.databaseName)
                    });
                }
            })
        );
        if (this.customQuery) {
            this.customQuery(queryBuilder);
        }
        return queryBuilder.getMany();
    }

    queryManyToOneOrOneToOneOwner() {
        let queryBuilder = this.connection
            .createQueryBuilder(this.queryRunner)
            .select(this.relationName)
            .from(this.type, this.relationName);
        queryBuilder.where(
            new Brackets((query) => {
                for (let column of this.relation.joinColumns) {
                    query.where(` "${column.referencedColumn.databaseName}" IN (:...values)`, {
                        values: this.getValues(column.databaseName)
                    });
                }
            })
        );
        if (this.customQuery) {
            this.customQuery(queryBuilder);
        }
        return queryBuilder.getMany();
    }
}
