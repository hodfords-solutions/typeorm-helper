import { BaseWhereExpression } from './base.where-expression';
import { WhereExpression } from 'typeorm';
import { WhereExpressionInterface } from '../interfaces/where-expression.interface';

export class CollectionWhereExpression extends BaseWhereExpression {
    public constructor(private whereExpressions: WhereExpressionInterface[]) {
        super();
    }

    where(query: WhereExpression) {
        for (let whereExpression of this.whereExpressions) {
            whereExpression.where(query);
        }
    }
}
