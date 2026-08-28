import { BaseEntity, RelationCondition } from '@hodfords/typeorm-helper';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    SelectQueryBuilder,
    ValueTransformer
} from 'typeorm';
import { PostEntity } from './post.entity.js';
import { isNumber } from 'es-toolkit';

class TimestampTransformer implements ValueTransformer {
    to(value: any): Date | number {
        if (isNumber(value)) {
            return new Date(value * 1000);
        }
        return value;
    }

    from(value: any): Date | number {
        if (!value) {
            return value;
        }
        return Math.round(+new Date(value) / 1000);
    }
}

@Entity('User')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => PostEntity, (post) => post.user, { cascade: true })
    posts: PostEntity[];

    @RelationCondition((query: SelectQueryBuilder<any>, entities) => {
        query.orderBy('id', 'DESC');
        if (entities.length === 1) {
            query.limit(1);
        } else {
            query.andWhere(
                ' "latestPost".id in (select max(id) from "Post" "maxPost" where "maxPost"."userId" = "latestPost"."userId")'
            );
        }
    })
    @OneToOne(() => PostEntity, (post) => post.user, { cascade: true })
    latestPost: PostEntity;

    @CreateDateColumn({ type: 'timestamp', transformer: new TimestampTransformer() })
    createdAt: number;
}
