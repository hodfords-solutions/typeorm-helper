import {getMetadataArgsStorage, ObjectType, RelationOptions, SelectQueryBuilder} from 'typeorm';
import {RelationIdMetadataArgs} from 'typeorm/metadata-args/RelationIdMetadataArgs';
import {RelationMetadataArgs} from 'typeorm/metadata-args/RelationMetadataArgs';

export function LoadRelation<T>(typeFunctionOrTarget: string | ((type?: any) => ObjectType<T>),
                                inverseSideOrOptions?: string | ((object: T) => any) | RelationOptions,
                                options?: RelationOptions): PropertyDecorator {

    // normalize parameters
    let inverseSideProperty: string | ((object: T) => any);
    if (typeof inverseSideOrOptions === 'object') {
        options = <RelationOptions>inverseSideOrOptions;
    } else {
        inverseSideProperty = <string | ((object: T) => any)>inverseSideOrOptions;
    }

    return function (object: Object, propertyName: string) {
        if (!options) options = {} as RelationOptions;

        let isLazy = options.lazy === true;
        if (!isLazy && Reflect && (Reflect as any).getMetadata) { // automatic determination
            const reflectedType = (Reflect as any).getMetadata('design:type', object, propertyName);
            if (reflectedType && typeof reflectedType.name === 'string' && reflectedType.name.toLowerCase() === 'promise')
                isLazy = true;
        }

        getMetadataArgsStorage().relations.push({
            target: object.constructor,
            propertyName: 'custom_' + propertyName,
            relationType: 'custom' as any,
            isLazy: isLazy,
            type: typeFunctionOrTarget,
            inverseSideProperty: inverseSideProperty,
            options: options
        } as RelationMetadataArgs);
    };
}
