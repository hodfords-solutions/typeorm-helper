import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../lib/entities/base.entity.js';

/**
 * Used only by the `TypeOrmHelperModule` example. It is deliberately left out of
 * `initializeTest()` so the module spec can prove that `forCustomRepository()`
 * registers the entity with the data source on its own.
 */
@Entity({ name: 'tag' })
export class TagEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
