import { WhereExpressionBuilder } from 'typeorm';
import { WhereExpressionInterface } from '../interfaces/where-expression.interface';
import { BaseWhereExpression } from './base.where-expression';

export class CollectionWhereExpression extends BaseWhereExpression {
    public constructor(private whereExpressions: WhereExpressionInterface[]) {
        super();
    }

    where(query: WhereExpressionBuilder) {
        for (let whereExpression of this.whereExpressions) {
            whereExpression.where(query);
        }
    }
}
