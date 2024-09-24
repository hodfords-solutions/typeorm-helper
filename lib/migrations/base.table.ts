import { TableColumn, TableForeignKey } from 'typeorm';
import { TableColumnOptions } from 'typeorm/schema-builder/options/TableColumnOptions';
import { BaseColumn } from './base.column';

export class BaseTable {
    private columns: BaseColumn[] = [];
    private changeIndexColumns: string[] = [];
    public columnToDeletes: string[] = [];

    public getNewColumns(): TableColumn[] {
        return this.columns.map((column) => column.tableColumn);
    }

    public dropColumn(columnName: string): void {
        this.columnToDeletes.push(columnName);
    }

    public getIndexColumns(): TableColumn[] {
        return this.columns
            .filter((column) => column.isIndex)
            .map((column) => column.tableColumn)
            .concat(this.changeIndexColumns.map((c) => new TableColumn({ name: c, type: null })));
    }

    public getForeignKeys(): TableForeignKey[] {
        const foreignKeys = [];
        for (const column of this.columns) {
            foreignKeys.push(...column.foreignKeys);
        }
        return foreignKeys;
    }

    private getColumnValue(
        intOptions: TableColumnOptions,
        options: Partial<TableColumnOptions> = undefined
    ): BaseColumn {
        return new BaseColumn(new TableColumn({ ...intOptions, ...options }));
    }

    public bytea(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name,
                type: 'bytea'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public string(name: string, length: number = 255, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'character varying',
                length: length as any
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public text(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'text'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public strings(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'character varying',
                isArray: true
            },
            options
        );

        this.columns.push(column);
        return column;
    }

    public uuid(name: string = 'id', options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'uuid'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public uuids(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'uuid',
                isArray: true
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public primaryUuid(name: string = 'id', options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'uuid',
                isPrimary: true,
                default: 'uuid_generate_v4()'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public integer(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'integer'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public smallint(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'smallint'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public bigint(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'bigint'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public integers(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'integer[]'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public double(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'double precision'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public timestamp(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'timestamp'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public date(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'date'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public decimal(
        name: string,
        precision: number = 10,
        scale: number = 2,
        options: Partial<TableColumnOptions> = null
    ): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'decimal',
                precision,
                scale
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public boolean(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'boolean'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public jsonb(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'jsonb'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public json(name: string, options: Partial<TableColumnOptions> = null): BaseColumn {
        const column = this.getColumnValue(
            {
                name: name,
                type: 'json'
            },
            options
        );
        this.columns.push(column);
        return column;
    }

    public baseTime(): void {
        this.createdAt();
        this.updatedAt();
    }

    public createdAt(): BaseColumn {
        const column = this.getColumnValue({
            type: 'timestamp',
            name: 'createdAt',
            default: 'now()'
        });
        this.columns.push(column);
        return column;
    }

    public updatedAt(): BaseColumn {
        const column = this.getColumnValue({
            type: 'timestamp',
            name: 'updatedAt',
            default: 'now()'
        });
        this.columns.push(column);
        return column;
    }

    public deletedAt(): BaseColumn {
        const column = this.getColumnValue({
            type: 'timestamp',
            name: 'deletedAt',
            isNullable: true
        });
        this.columns.push(column);
        return column;
    }

    public addIndexAlreadyColumn(columnName: string): void {
        this.changeIndexColumns.push(columnName);
    }
}
