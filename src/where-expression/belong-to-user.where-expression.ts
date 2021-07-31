import { BaseWhereExpression } from '../../libs';
import { WhereExpression } from 'typeorm';

export class BelongToUserWhereExpression extends BaseWhereExpression {
    constructor(private userId: number) {
        super();
    }

    where(query: WhereExpression) {
        query.where({ userId: this.userId });
    }
}
