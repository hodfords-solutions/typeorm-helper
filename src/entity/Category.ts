import { Column, PrimaryGeneratedColumn, Entity, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from '../../libs';
import { Post } from './Post';
import { PostCategory } from './PostCategory';

@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Post, (post) => post.categories)
    posts: Post[];

    @OneToMany(() => PostCategory, postToCategory => postToCategory.category)
    public postCategories!: PostCategory[];
}
