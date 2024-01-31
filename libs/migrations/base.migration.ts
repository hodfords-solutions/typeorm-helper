import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { BaseTable } from './base.table';

export abstract class BaseMigration implements MigrationInterface {
    private queryRunner: QueryRunner = null;

    async create(tableName, callback: (table: BaseTable) => void) {
        let table = new BaseTable();
        callback(table);
        let newTable = new Table();
        newTable.name = tableName;
        newTable.columns = table.getNewColumns();
        await this.queryRunner.createTable(newTable);
        await this.createIndex(tableName, table);
        await this.createForeignKeys(tableName, table);
    }

    async update(tableName, callback: (table: BaseTable) => void) {
        let table = new BaseTable();
        callback(table);
        for (let column of table.columnToDeletes) {
            await this.queryRunner.dropColumn(tableName, column);
        }
        if (table.getNewColumns()) {
            await this.queryRunner.addColumns(tableName, table.getNewColumns());
        }
        await this.createIndex(tableName, table);
        await this.createForeignKeys(tableName, table);
    }

    async drop(table) {
        await this.queryRunner.dropTable(table);
    }

    async createForeignKeys(tableName, table: BaseTable) {
        for (let column of table.getForeignKeys()) {
            await this.queryRunner.createForeignKey(tableName, column);
        }
    }

    async createIndex(tableName, table: BaseTable) {
        for (let column of table.getIndexColumns()) {
            let index = new TableIndex({
                name: `${tableName}-${column.name}Index`,
                columnNames: [column.name]
            });
            await this.queryRunner.createIndex(tableName, index);
        }
    }

    abstract run(queryRunner: QueryRunner);

    rollback(queryRunner: QueryRunner) {
        console.log('No rollback');
    }

    async down(queryRunner: QueryRunner) {
        this.queryRunner = queryRunner;
        await this.rollback(queryRunner);
    }

    async up(queryRunner: QueryRunner) {
        this.queryRunner = queryRunner;
        await this.run(queryRunner);
    }
}
