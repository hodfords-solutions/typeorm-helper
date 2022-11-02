import { TransactionService } from '../services/transaction.service';
import { getConnection } from 'typeorm';

/**
 * This decorator is used to mark methods in classes that will open a transaction if one is not already opened.
 * The method is applied this decorator can not be reused on other transaction methods due to difference transaction isolation levels.
 * Should apply to methods that are entry point of data manipulation or http requests.
 * @returns {(target: any) => any}
 */
export function Transactional(): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        if (!(target instanceof TransactionService)) {
            throw new Error('Transactional decorator can only be used on a class that extends TransactionService');
        }
        descriptor.value = async function (...args: any[]) {
            return await getConnection().transaction(async (manager) => {
                const transactionInstance = this.withTransaction(manager);
                return originalMethod.call(transactionInstance, ...args);
            });
        };
    };
}
