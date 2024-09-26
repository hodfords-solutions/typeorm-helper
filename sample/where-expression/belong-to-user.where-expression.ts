import { BaseWhereExpression } from '@hodfords/typeorm-helper';
import { WhereExpressionBuilder } from 'typeorm';

export class BelongToUserWhereExpression extends BaseWhereExpression {
    constructor(private userId: number) {
        super();
    }

    where(query: WhereExpressionBuilder) {
        query.where({ userId: this.userId });
    }
}
