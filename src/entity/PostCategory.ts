import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../libs';
import { Post } from './Post';
import { Category } from './Category';

@Entity('postCategories')
export class PostCategory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    postId: number;

    @Column({ nullable: true })
    categoryId: number;

    @ManyToOne(() => Post, (post) => post.postCategories)
    public post!: Post;

    @ManyToOne(() => Category, (category) => category.postCategories)
    public category!: Category;
}
