import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from './post.entity';
import { PostCategoryEntity } from './post-category.entity';
import { BaseEntity } from '@hodfords/typeorm-helper';

@Entity('Category')
export class CategoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => PostEntity, (post) => post.categories, { createForeignKeyConstraints: false })
    @JoinTable({ name: 'postCategories' })
    posts: PostEntity[];

    @OneToMany(() => PostCategoryEntity, (postToCategory) => postToCategory.category)
    postCategories: PostCategoryEntity[];
}
