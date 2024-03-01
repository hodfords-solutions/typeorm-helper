import { Brackets, WhereExpressionBuilder } from 'typeorm';
import { WhereExpressionInterface } from '../interfaces/where-expression.interface';

export abstract class BaseWhereExpression extends Brackets implements WhereExpressionInterface {
    public constructor() {
        super((query) => this.where(query));
    }

    abstract where(query: WhereExpressionBuilder);
}
