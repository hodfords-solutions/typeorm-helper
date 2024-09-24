import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../lib';
import { PostEntity } from './post.entity';
import { CategoryEntity } from './category.entity';

@Entity('PostCategory')
export class PostCategoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    postId: number;

    @Column({ nullable: true })
    categoryId: number;

    @ManyToOne(() => PostEntity, (post) => post.postCategories)
    public post!: PostEntity;

    @ManyToOne(() => CategoryEntity, (category) => category.postCategories)
    public category!: CategoryEntity;
}
