import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from './post.entity';
import { CategoryEntity } from './category.entity';
import { BaseEntity } from '@hodfords/typeorm-helper';

@Entity('PostCategory')
export class PostCategoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    postId: number;

    @Column({ nullable: true })
    categoryId: number;

    @ManyToOne(() => PostEntity, (post) => post.postCategories)
    post: PostEntity;

    @ManyToOne(() => CategoryEntity, (category) => category.postCategories)
    category: CategoryEntity;
}
