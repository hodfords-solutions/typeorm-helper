import { WhereExpressionBuilder } from 'typeorm';
import { WhereExpressionInterface } from '../interfaces/where-expression.interface.js';
import { BaseWhereExpression } from './base.where-expression.js';

export class CollectionWhereExpression extends BaseWhereExpression {
    public constructor(private whereExpressions: WhereExpressionInterface[]) {
        super();
    }

    where(query: WhereExpressionBuilder): void {
        for (const whereExpression of this.whereExpressions) {
            whereExpression.where(query);
        }
    }
}
