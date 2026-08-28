import { Injectable, Module } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmHelperModule } from '../lib/modules/typeorm-module.module.js';
import { TagEntity } from './entities/tag.entity.js';
import { TagRepository } from './repositories/tag.repository.js';

@Injectable()
export class TagService {
    constructor(private readonly tagRepository: TagRepository) {}

    create(name: string): Promise<TagEntity> {
        return this.tagRepository.save(this.tagRepository.create({ name }));
    }

    findByName(name: string): Promise<TagEntity | null> {
        return this.tagRepository.findByName(name);
    }
}

/**
 * Example wiring for `TypeOrmHelperModule`.
 *
 * Note that `dataSourceOptions` intentionally declares **no** `entities`: registering
 * `TagRepository` through `forCustomRepository()` is what makes `TagEntity` known to the
 * data source, so `synchronize` can create its table and the repository can be injected.
 *
 * This requires `autoLoadEntities: true` — @nestjs/typeorm only merges entities registered
 * through `forFeature()` into the data source when that flag is set. Without it you must
 * list the entities in `dataSourceOptions.entities` yourself.
 */
@Module({})
export class TagModule {
    static forRoot(dataSourceOptions: TypeOrmModuleOptions) {
        return {
            module: TagModule,
            imports: [
                TypeOrmHelperModule.forRoot(dataSourceOptions),
                TypeOrmHelperModule.forCustomRepository([TagRepository])
            ],
            providers: [TagService],
            exports: [TagService]
        };
    }
}
