import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { CategoryEntity } from './category.entity';
import { PostCategoryEntity } from './post-category.entity';
import { UserEntity } from './user.entity';
import { BaseEntity } from '@hodfords/typeorm-helper';

@Entity('Post')
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => UserEntity, (user) => user.posts)
    user: UserEntity;

    @Column({ nullable: true })
    userId: number;

    @OneToMany(() => PostCategoryEntity, (postToCategory) => postToCategory.post)
    postCategories: PostCategoryEntity[];

    @ManyToMany(() => CategoryEntity, (category) => category.posts, { createForeignKeyConstraints: false })
    @JoinTable({ name: 'postCategories' })
    categories: CategoryEntity[];
}
