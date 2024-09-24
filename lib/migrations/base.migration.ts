import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { BaseTable } from './base.table';

export abstract class BaseMigration implements MigrationInterface {
    private queryRunner: QueryRunner = null;

    async create(tableName: string, callback: (table: BaseTable) => void): Promise<void> {
        const table = new BaseTable();
        callback(table);
        const newTable = new Table();
        newTable.name = tableName;
        newTable.columns = table.getNewColumns();
        await this.queryRunner.createTable(newTable);
        await this.createIndex(tableName, table);
        await this.createForeignKeys(tableName, table);
    }

    async update(tableName: string, callback: (table: BaseTable) => void): Promise<void> {
        const table = new BaseTable();
        callback(table);
        for (const column of table.columnToDeletes) {
            await this.queryRunner.dropColumn(tableName, column);
        }
        if (table.getNewColumns()) {
            await this.queryRunner.addColumns(tableName, table.getNewColumns());
        }
        await this.createIndex(tableName, table);
        await this.createForeignKeys(tableName, table);
    }

    async drop(table: Table | string): Promise<void> {
        await this.queryRunner.dropTable(table);
    }

    async createForeignKeys(tableName: string, table: BaseTable): Promise<void> {
        for (const column of table.getForeignKeys()) {
            await this.queryRunner.createForeignKey(tableName, column);
        }
    }

    async createIndex(tableName: string, table: BaseTable): Promise<void> {
        for (const column of table.getIndexColumns()) {
            const index = new TableIndex({
                name: `${tableName}-${column.name}Index`,
                columnNames: [column.name]
            });
            await this.queryRunner.createIndex(tableName, index);
        }
    }

    abstract run(queryRunner: QueryRunner): Promise<void>;

    async rollback(queryRunner: QueryRunner): Promise<void> {
        console.log('No rollback');
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        this.queryRunner = queryRunner;
        await this.rollback(queryRunner);
    }

    async up(queryRunner: QueryRunner): Promise<void> {
        this.queryRunner = queryRunner;
        await this.run(queryRunner);
    }
}
