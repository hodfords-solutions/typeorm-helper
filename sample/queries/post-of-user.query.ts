import { BaseQuery } from '../../lib/queries/base.query';
import { PostEntity } from '../entities/post.entity';
import { SelectQueryBuilder } from 'typeorm';

export class PostOfUserQuery extends BaseQuery<PostEntity> {
    constructor(private userId: number) {
        super();
    }

    query(query: SelectQueryBuilder<PostEntity>) {
        query.where({ userId: this.userId }).limit(10);
    }
}
