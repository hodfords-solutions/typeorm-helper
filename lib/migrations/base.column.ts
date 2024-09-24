import { TableColumn, TableForeignKey } from 'typeorm';
import { TableForeignKeyOptions } from 'typeorm/schema-builder/options/TableForeignKeyOptions';

export class BaseColumn {
    public isIndex = false;
    public foreignKeys: TableForeignKeyOptions[] = [];

    public constructor(public tableColumn: TableColumn) {}

    public length(length: number): this {
        this.tableColumn.length = length as any;
        return this;
    }

    public nullable(): this {
        this.tableColumn.isNullable = true;
        return this;
    }

    public unique(): this {
        this.tableColumn.isUnique = true;
        return this;
    }

    public index(): this {
        this.isIndex = true;
        return this;
    }

    public default(value: any): this {
        this.tableColumn.default = value;
        return this;
    }

    public foreign(table: string, column: string = 'id', onDelete = 'CASCADE', onUpdate = 'CASCADE'): void {
        this.foreignKeys.push(
            new TableForeignKey({
                columnNames: [this.tableColumn.name],
                referencedTableName: table,
                referencedColumnNames: [column],
                onDelete: onDelete,
                onUpdate: onUpdate
            })
        );
    }
}
