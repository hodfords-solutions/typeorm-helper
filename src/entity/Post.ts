import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { BaseEntity } from '../../libs';
import { Category } from './Category';
import { PostCategory } from './PostCategory';

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => User, (user) => user.posts)
    user: User;

    @Column({ nullable: true })
    userId: string;

    @OneToMany(() => PostCategory, postToCategory => postToCategory.post)
    public postCategories!: PostCategory[];

    @ManyToMany(() => Category, (category) => category.posts, { createForeignKeyConstraints: false })
    @JoinTable({ name: 'postCategories' })
    categories: Category[];

}
