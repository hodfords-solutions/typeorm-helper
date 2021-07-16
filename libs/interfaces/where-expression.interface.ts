import { WhereExpression } from 'typeorm';

export interface WhereExpressionInterface {
    where(query: WhereExpression);
}
