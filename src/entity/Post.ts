import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { BaseEntity } from '../../libs';

@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    // @ManyToMany((type) => Category, (category) => category. )
    // @JoinTable()
    // categories: Category[];

    @ManyToOne(() => User, (user) => user.posts)
    user: User;

    @Column({ nullable: true })
    userId: string;
}
