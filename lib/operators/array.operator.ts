import { randomBytes } from 'crypto';
import { FindOperator, Raw } from 'typeorm';

function arrayFindRaw(value, operator: string, type: string) {
    const param = `rawArrayParam${randomBytes(16).toString('hex')}`;
    const arrayValue = Array.isArray(value) ? value : [value];
    return Raw((column) => ` ${column} ${operator} ARRAY[:...${param}]::${type}[]  `, { [param]: arrayValue });
}

export function ArrayContains<T>(value: T | FindOperator<T>, type: string) {
    return arrayFindRaw(value, '@>', type);
}

export function ArrayContainedBy<T>(value: T | FindOperator<T>, type: string) {
    return arrayFindRaw(value, '<@', type);
}

export function ArrayOverlap<T>(value: T | FindOperator<T>, type: string) {
    return arrayFindRaw(value, '&&', type);
}

export function ArrayGte<T>(value: T | FindOperator<T>, type: string) {
    return arrayFindRaw(value, '>=', type);
}

export function ArrayLte<T>(value: T | FindOperator<T>, type: string) {
    return arrayFindRaw(value, '<=', type);
}

export function ArrayGt<T>(value: T | FindOperator<T>, type: string) {
    return arrayFindRaw(value, '>', type);
}

export function ArrayLt<T>(value: T | FindOperator<T>, type: string) {
    return arrayFindRaw(value, '<', type);
}

export function ArrayEq<T>(value: T | FindOperator<T>, type: string) {
    return arrayFindRaw(value, '=', type);
}

export function ArrayNotEq<T>(value: T | FindOperator<T>, type: string) {
    return arrayFindRaw(value, '<>', type);
}
