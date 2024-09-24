import { WhereExpressionBuilder } from 'typeorm';

export interface WhereExpressionInterface {
    where(query: WhereExpressionBuilder): void;
}
