import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { BaseEntity } from '../../lib';
import { CategoryEntity } from './category.entity';
import { PostCategoryEntity } from './post-category.entity';

@Entity('Post')
export class PostEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => UserEntity, (user) => user.posts)
    user: UserEntity;

    @Column({ nullable: true })
    userId: string;

    @OneToMany(() => PostCategoryEntity, (postToCategory) => postToCategory.post)
    public postCategories!: PostCategoryEntity[];

    @ManyToMany(() => CategoryEntity, (category) => category.posts, { createForeignKeyConstraints: false })
    @JoinTable({ name: 'postCategories' })
    categories: CategoryEntity[];
}
