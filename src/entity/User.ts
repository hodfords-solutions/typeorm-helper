import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, SelectQueryBuilder } from 'typeorm';
import { Post } from './Post';
import { BaseEntity } from '../../libs';
import { RelationCondition } from '../../libs/decorators/relation-condition.decorator';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Post, (post) => post.user, { cascade: true })
    posts: Post[];

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
    @OneToOne(() => Post, (post) => post.user, { cascade: true })
    latestPost: Post;
}
