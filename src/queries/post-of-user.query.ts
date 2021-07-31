import { BaseQuery } from '../../libs/queries/base.query';
import { Post } from '../entity/Post';
import { SelectQueryBuilder } from 'typeorm';

export class PostOfUserQuery extends BaseQuery<Post> {
    constructor(private userId: number) {
        super();
    }

    query(query: SelectQueryBuilder<Post>) {
        query.where({ userId: this.userId }).limit(10);
    }
}
