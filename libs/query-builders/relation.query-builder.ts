import { getDataSource } from '../containers/data-source-container';
import { uniq } from 'lodash';
import { Brackets, DataSource, ObjectLiteral, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { RelationConditionInterface } from '../interfaces/relation-condition.interface';

export class RelationQueryBuilder {
    public relation: RelationMetadata;
    public relationCondition: RelationConditionInterface;
    private dataSource: DataSource;
    private customQueries: ((queryBuilder: SelectQueryBuilder<any>) => void)[] = [];
    public results: any[];
    public entities: any[] = [];

    constructor(
        entityOrEntities: ObjectLiteral | ObjectLiteral[],
        private relationName: string,
        private queryRunner?: QueryRunner
    ) {
        if (queryRunner && !queryRunner.isReleased) {
            this.dataSource = queryRunner.connection;
        } else {
            this.queryRunner = undefined;
            this.dataSource = getDataSource();
        }
        this.entities = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];
        let entity = this.dataSource.getMetadata(this.entities[0].constructor);
        this.relation = entity.relations.find((relation) => relation.propertyName === relationName);
        this.relationCondition = entity.relationConditions.find((relation) => relation.propertyName === relationName);
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
            return this.assignDataManyToOneOrOneToOne();
        } else if (this.relation.isOneToOneNotOwner) {
            return this.assignOneToOneNotOwner();
        } else if (this.relation.isOneToMany) {
            return this.assignOneToMany();
        } else if (this.relation.isManyToManyOwner) {
            return this.assignManyToManyOwner();
        } else {
            return this.assignManyToManyNotOwner();
        }
    }

    assignDataManyToOneOrOneToOne() {
        for (let entity of this.entities) {
            entity[this.relationName] = this.results.find((result) => {
                for (let column of this.relation.joinColumns) {
                    if (entity[column.databaseName] !== result[column.referencedColumn.databaseName]) {
                        return false;
                    }
                    if (this.relationCondition?.options?.map) {
                        if (!this.relationCondition.options.map(entity, result, column)) {
                            return false;
                        }
                    }
                }
                return true;
            });
        }
    }

    assignOneToOneNotOwner() {
        for (let entity of this.entities) {
            entity[this.relationName] = this.results.find((result) => {
                for (let column of this.inverseRelation.joinColumns) {
                    if (entity[column.referencedColumn.databaseName] !== result[column.databaseName]) {
                        return false;
                    }
                    if (this.relationCondition?.options?.map) {
                        if (!this.relationCondition.options.map(entity, result, column)) {
                            return false;
                        }
                    }
                }
                return true;
            });
        }
    }

    assignOneToMany() {
        for (let entity of this.entities) {
            entity[this.relationName] = this.results.filter((result) => {
                for (let column of this.inverseRelation.joinColumns) {
                    if (entity[column.referencedColumn.databaseName] !== result[column.databaseName]) {
                        return false;
                    }
                    if (this.relationCondition?.options?.map) {
                        if (!this.relationCondition.options.map(entity, result, column)) {
                            return false;
                        }
                    }
                }
                return true;
            });
        }
        this.customAssign();
    }

    assignManyToManyOwner() {
        for (let entity of this.entities) {
            entity[this.relationName] = this.results.filter((result) => {
                for (let column of this.relation.joinColumns) {
                    if (!this.checkMapValueManyToMany(entity, result, column)) {
                        return false;
                    }
                }
                return true;
            });
        }

        for (let result of this.results) {
            if (this.relation.junctionEntityMetadata) {
                delete result[`${this.relation.junctionEntityMetadata.tableName}`];
            }
        }
        this.customAssign();
    }

    customAssign() {
        if (this.relationCondition && !this.relationCondition.isArray) {
            for (let entity of this.entities) {
                entity[this.relationName] = entity[this.relationName][0];
            }
        }
    }

    checkMapValueManyToMany(entity, result, column) {
        const junctionEntityMetadata = this.relation.junctionEntityMetadata;
        if (
            junctionEntityMetadata &&
            !result[junctionEntityMetadata.tableName].find((child) => {
                return child[column.databaseName] === entity[column.referencedColumn.databaseName];
            })
        ) {
            return false;
        }
        if (this.relationCondition?.options?.map) {
            if (!this.relationCondition.options.map(entity, result, column)) {
                return false;
            }
        }

        return true;
    }

    assignManyToManyNotOwner() {
        for (let entity of this.entities) {
            entity[this.relationName] = this.results.filter((result) => {
                for (let column of this.relation.inverseRelation.inverseJoinColumns) {
                    if (!this.checkMapValueManyToMany(entity, result, column)) {
                        return false;
                    }
                }
                return true;
            });
        }
        for (let result of this.results) {
            if (this.relation.junctionEntityMetadata) {
                delete result[`${this.relation.junctionEntityMetadata.tableName}`];
            }
        }
        this.customAssign();
    }

    addCustomQuery(customQuery: (name: SelectQueryBuilder<any>) => void) {
        this.customQueries.push(customQuery);
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

    private applyQueryBuilder(queryBuilder: SelectQueryBuilder<any>) {
        if (this.customQueries?.length) {
            for (let customQuery of this.customQueries) {
                customQuery(queryBuilder);
            }
        }
        if (this.relationCondition?.options?.query) {
            this.relationCondition.options.query(queryBuilder, this.entities);
        }
    }

    queryOneToManyOrOneToOneNotOwner() {
        let queryBuilder = this.dataSource
            .createQueryBuilder(this.queryRunner)
            .select(this.relationName)
            .from(this.inverseRelation.entityMetadata.target, this.relationName);
        queryBuilder.where(
            new Brackets((query) => {
                for (let column of this.inverseRelation.joinColumns) {
                    query.where(`"${column.databaseName}" IN (:...values)`, {
                        values: this.getValues(column.referencedColumn.databaseName)
                    });
                }
            })
        );
        this.applyQueryBuilder(queryBuilder);
        return queryBuilder.getMany();
    }

    queryManyToOneOrOneToOneOwner() {
        let queryBuilder = this.dataSource
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
        this.applyQueryBuilder(queryBuilder);
        return queryBuilder.getMany();
    }

    queryManyToManyOwner() {
        const joinAlias = this.relation.junctionEntityMetadata?.tableName || '';
        const joinColumnConditions = this.relation.joinColumns.map((joinColumn) => {
            return `${joinAlias}.${joinColumn.propertyName} IN (:...${joinColumn.propertyName})`;
        });
        const inverseJoinColumnConditions = this.relation.inverseJoinColumns.map((inverseJoinColumn) => {
            return `${joinAlias}.${inverseJoinColumn.propertyName}=${this.relation.propertyName}.${
                inverseJoinColumn.referencedColumn?.propertyName || ''
            }`;
        });
        const parameters = this.relation.joinColumns.reduce((parameters, joinColumn) => {
            if (joinColumn.referencedColumn) {
                parameters[joinColumn.propertyName] = this.entities.map((entity) =>
                    joinColumn.referencedColumn.getEntityValue(entity)
                );
            }
            return parameters;
        }, {} as ObjectLiteral);

        return this.queryManyToMany(joinColumnConditions, inverseJoinColumnConditions, parameters);
    }

    queryManyToManyNotOwner() {
        const joinAlias = this.relation.junctionEntityMetadata?.tableName || '';
        const joinColumns = this.inverseRelation?.joinColumns || [];
        const joinColumnConditions = joinColumns.map((joinColumn) => {
            return `${joinAlias}.${joinColumn.propertyName} = ${this.relation.propertyName}.${
                joinColumn.referencedColumn?.propertyName || ''
            }`;
        });

        const inverseJoinColumns = this.inverseRelation?.inverseJoinColumns || [];
        const inverseJoinColumnConditions = inverseJoinColumns.map((inverseJoinColumn) => {
            return `${joinAlias}.${inverseJoinColumn.propertyName} IN (:...${inverseJoinColumn.propertyName})`;
        });
        const parameters = inverseJoinColumns.reduce((parameters, joinColumn) => {
            if (joinColumn.referencedColumn) {
                parameters[joinColumn.propertyName] = this.entities.map((entity) =>
                    joinColumn.referencedColumn.getEntityValue(entity)
                );
            }
            return parameters;
        }, {} as ObjectLiteral);

        return this.queryManyToMany(joinColumnConditions, inverseJoinColumnConditions, parameters);
    }

    queryManyToMany(joinColumnConditions, inverseJoinColumnConditions, parameters) {
        const mainAlias = this.relation.propertyName;
        const joinAlias = this.relation.junctionEntityMetadata?.tableName || '';
        let queryBuilder = this.dataSource
            .createQueryBuilder(this.type, mainAlias, this.queryRunner)
            .innerJoinAndMapMany(
                `${mainAlias}.${joinAlias}`,
                `${mainAlias}.${joinAlias}`,
                joinAlias,
                [...joinColumnConditions, ...inverseJoinColumnConditions].join(' AND ')
            )
            .setParameters(parameters);

        this.applyQueryBuilder(queryBuilder);
        return queryBuilder.getMany() as any;
    }
}
