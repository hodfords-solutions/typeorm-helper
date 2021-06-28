import { Column, Entity, OneToMany, PrimaryGeneratedColumn, QueryBuilder, SelectQueryBuilder } from 'typeorm';
import { Post } from './Post';
import { BaseEntity } from '../../libs';
import { RelationCondition } from '../../libs/decorators/relation-condition.decorator';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;


    @RelationCondition((query: SelectQueryBuilder<any>) => {
        query.where('Post.id = :postId', { id: 1 });
    })
    @OneToMany(() => Post, (post) => post.user, { cascade: true })
    posts: Post[];
}
