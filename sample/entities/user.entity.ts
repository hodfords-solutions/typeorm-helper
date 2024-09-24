import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, SelectQueryBuilder } from 'typeorm';
import { PostEntity } from './post.entity';
import { BaseEntity } from '../../lib';
import { RelationCondition } from '../../lib/decorators/relation-condition.decorator';

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
                ' "latestPost".id in (select max(id) from "post" "maxPost" where "maxPost"."userId" = "latestPost"."userId")'
            );
        }
    })
    @OneToOne(() => PostEntity, (post) => post.user, { cascade: true })
    latestPost: PostEntity;
}
