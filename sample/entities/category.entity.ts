import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../lib';
import { PostEntity } from './post.entity';
import { PostCategoryEntity } from './post-category.entity';

@Entity('Category')
export class CategoryEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => PostEntity, (post) => post.categories)
    posts: PostEntity[];

    @OneToMany(() => PostCategoryEntity, (postToCategory) => postToCategory.category)
    public postCategories!: PostCategoryEntity[];
}
