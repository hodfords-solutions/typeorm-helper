import { Column, PrimaryGeneratedColumn, Entity } from 'typeorm';
import { BaseEntity } from '../../libs';

@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
}
