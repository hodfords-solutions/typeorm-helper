import { getDataSourceToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TagEntity } from '../sample/entities/tag.entity.js';
import { TagRepository } from '../sample/repositories/tag.repository.js';
import { TagModule, TagService } from '../sample/tag.module.js';

/**
 * Covers `TypeOrmHelperModule.forCustomRepository()`, which used to reach into the private
 * `EntitiesMetadataStorage` of @nestjs/typeorm. v12 removed that export, so the module now
 * goes through `TypeOrmModule.forFeature()`. These tests assert the observable behaviour
 * that storage provided: the entity ends up registered on the data source.
 */
const SCHEMA = 'typeorm_helper_example';
const CONNECTION = {
    type: 'postgres',
    host: 'localhost',
    port: 9432,
    username: 'test',
    password: 'test',
    database: 'test'
} as const;

describe('TypeOrmHelperModule', () => {
    let moduleRef: TestingModule;
    let dataSource: DataSource;

    beforeAll(async () => {
        // Isolate from the seeded fixtures the other specs share. TypeORM will not create a
        // non-default schema on its own, so it is provisioned up front.
        const bootstrap = new DataSource({ ...CONNECTION });
        await bootstrap.initialize();
        await bootstrap.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
        await bootstrap.query(`CREATE SCHEMA ${SCHEMA}`);
        await bootstrap.destroy();

        moduleRef = await Test.createTestingModule({
            imports: [
                TagModule.forRoot({
                    ...CONNECTION,
                    schema: SCHEMA,
                    autoLoadEntities: true,
                    synchronize: true
                })
            ]
        }).compile();

        await moduleRef.init();
        dataSource = moduleRef.get<DataSource>(getDataSourceToken());
    }, 60_000);

    afterAll(async () => {
        await moduleRef?.close();
    });

    it('registers the repository entity with the data source without listing it in forRoot', () => {
        // This is what EntitiesMetadataStorage.addEntitiesByDataSource() used to achieve.
        const registered = dataSource.entityMetadatas.map((metadata) => metadata.target);

        expect(registered).toContain(TagEntity);
    });

    it('creates the table for the registered entity', async () => {
        const exists = await dataSource.query(
            `SELECT to_regclass('${SCHEMA}.tag') IS NOT NULL AS present`
        );

        expect(exists[0].present).toBe(true);
    });

    it('injects the custom repository as a provider', () => {
        const repository = moduleRef.get(TagRepository);

        expect(repository).toBeInstanceOf(TagRepository);
    });

    it('binds the repository to the right entity and data source', () => {
        const repository = moduleRef.get(TagRepository);

        expect(repository.target).toBe(TagEntity);
        expect(repository.manager.connection).toBe(dataSource);
    });

    it('runs custom repository methods against the database', async () => {
        const service = moduleRef.get(TagService);
        const created = await service.create('release');

        expect(created.id).toBeGreaterThan(0);
        await expect(service.findByName('release')).resolves.toMatchObject({
            id: created.id,
            name: 'release'
        });
    });

    it('returns null when the custom finder matches nothing', async () => {
        const service = moduleRef.get(TagService);

        await expect(service.findByName('does-not-exist')).resolves.toBeNull();
    });
});
