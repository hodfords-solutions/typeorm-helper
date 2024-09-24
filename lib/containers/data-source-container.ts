import { DataSource } from 'typeorm';

const dataSourceContainer: Map<string, DataSource> = new Map();

export function getDataSource(dataSourceName = 'default') {
    return dataSourceContainer.get(dataSourceName);
}

export function setDataSource(dataSource: DataSource, dataSourceName = 'default') {
    dataSourceContainer.set(dataSourceName, dataSource);
}
