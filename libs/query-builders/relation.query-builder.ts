import {uniq} from 'lodash';
import {Brackets, Connection, getConnection, ObjectLiteral, QueryRunner, SelectQueryBuilder} from 'typeorm';
import {RelationMetadata} from 'typeorm/metadata/RelationMetadata';
import {PostCategory} from '../../src/entity/PostCategory';
import {Category} from '../../src/entity/Category';

export class RelationQueryBuilder {
    public relation: RelationMetadata;
    public customRelation: RelationMetadata;
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
        this.customRelation = entity.relations.find((relation) => relation.propertyName === `custom_${relationName}`);
    }

    async load() {
        if (this.relation.isManyToOne || this.relation.isOneToOneOwner) {
            this.results = await this.queryManyToOneOrOneToOneOwner();
        } else if (this.relation.isOneToMany || this.relation.isOneToOneNotOwner) {
            this.results = await this.queryOneToManyOrOneToOneNotOwner();
        } else if (this.relation.isManyToManyOwner) {
            this.results = await this.queryManyToManyOwner();
        } else {
            this.results = await this.queryManyToManyNotOwner();
        }
        this.assignData();
    }

    assignData() {
        if (this.relation.isManyToOne || this.relation.isOneToOneOwner) {
            return this.assignDataManyToOneOrOneToOneOwner();
        } else if (this.relation.isOneToMany || this.relation.isOneToOneNotOwner) {
            return this.assignOneToManyOrOneToOneNotOwner();
        } else if (this.relation.isManyToManyOwner) {
            return this.assignManyToMany();
        } else {
            return this.assignManyToMany();
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

    assignManyToMany() {
        console.log(this.results);
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

    queryManyToManyOwner() {
        const joinAlias = this.relation.junctionEntityMetadata!.tableName;
        const joinColumnConditions = this.relation.joinColumns.map(joinColumn => {
            return `${joinAlias}.${joinColumn.propertyName} IN (:...${joinColumn.propertyName})`;
        });
        const inverseJoinColumnConditions = this.relation.inverseJoinColumns.map(inverseJoinColumn => {
            return `${joinAlias}.${inverseJoinColumn.propertyName}=${this.relation.propertyName}.${inverseJoinColumn.referencedColumn!.propertyName}`;
        });
        const parameters = this.relation.joinColumns.reduce((parameters, joinColumn) => {
            parameters[joinColumn.propertyName] = this.entities.map(entity => joinColumn.referencedColumn!.getEntityValue(entity));
            return parameters;
        }, {} as ObjectLiteral);

        return this.queryManyToMany(joinColumnConditions, inverseJoinColumnConditions, parameters);
    }

    queryManyToManyNotOwner() {
        const joinAlias = this.relation.junctionEntityMetadata!.tableName;
        const joinColumnConditions = this.inverseRelation!.joinColumns.map(joinColumn => {
            return `${joinAlias}.${joinColumn.propertyName} = ${this.relation.propertyName}.${joinColumn.referencedColumn!.propertyName}`;
        });
        const inverseJoinColumnConditions = this.inverseRelation!.inverseJoinColumns.map(inverseJoinColumn => {
            return `${joinAlias}.${inverseJoinColumn.propertyName} IN (:...${inverseJoinColumn.propertyName})`;
        });
        const parameters = this.inverseRelation!.inverseJoinColumns.reduce((parameters, joinColumn) => {
            parameters[joinColumn.propertyName] = this.entities.map(entity => joinColumn.referencedColumn!.getEntityValue(entity));
            return parameters;
        }, {} as ObjectLiteral);

        return this.queryManyToMany(joinColumnConditions, inverseJoinColumnConditions, parameters);
    }

    queryManyToMany(joinColumnConditions, inverseJoinColumnConditions, parameters) {
        // console.log(this.relation);
        // // let a = await this.connection
        // //     .createQueryBuilder(this.queryRunner)
        // //     .select(this.relation.propertyName)
        // //     .from([Category, this.relation.propertyName)
        // //     .getMany();
        // // console.log(this.type);
        // // console.log(a);
        console.log(this.customRelation);
        const mainAlias = this.relation.propertyName;
        console.log(mainAlias);
        const joinAlias = this.relation.junctionEntityMetadata!.tableName;
        console.log(joinAlias);
        let queryBuilder = this.connection
            .createQueryBuilder(this.queryRunner)
            .select([mainAlias, joinAlias])
            .from(this.customRelation.type, mainAlias)
            .innerJoin(joinAlias, joinAlias, [...joinColumnConditions, ...inverseJoinColumnConditions].join(' AND '))
            .setParameters(parameters);

        if (this.customQuery) {
            this.customQuery(queryBuilder);
        }
        return queryBuilder.getMany() as any;
    }
}
