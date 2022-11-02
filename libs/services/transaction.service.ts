import { Injectable } from '@nestjs/common';
import { PARAMTYPES_METADATA } from '@nestjs/common/constants';
import { ModuleRef } from '@nestjs/core';
import { isString } from 'lodash';
import { EntityManager, Repository } from 'typeorm';
import { ClassType } from '../types/class.type';
import { ForwardRef } from '../types/forward-ref.type';
import { TransactionOption } from '../interfaces/transaction-option.interface';
import { ProviderParam } from '../types/provider-param.type';
import { EXCLUDED_OPTIONS } from '../constants/excluded.constant';
import { ExcludeType } from '../types/exclude.type';

@Injectable()
export class TransactionService {
    public static moduleRef: ModuleRef = null;
    protected excluded: ExcludeType[] = [];

    public withTransaction(manager: EntityManager, transactionOptions: TransactionOption = {}): this {
        let cache: Map<string, any> = new Map();
        return this.findArgumentsForProvider(
            this.constructor as ClassType<this>,
            manager,
            [
                ...TransactionService.moduleRef.get(EXCLUDED_OPTIONS, { strict: false }),
                ...this.excluded,
                transactionOptions.excluded ?? []
            ],
            cache
        );
    }

    private refId(param: ProviderParam) {
        return `${(param as ClassType).name}-ref`;
    }

    private resolveForwardRefArgument(
        param: ProviderParam,
        instanceHost: ProviderParam,
        manager: EntityManager,
        excluded: ExcludeType[],
        cache: Map<string, any>
    ) {
        let tmpParam = (param as ForwardRef).forwardRef();
        tmpParam = TransactionService.moduleRef.get(tmpParam, { strict: false }).constructor;
        const id = this.refId(instanceHost);
        if (cache.has(this.refId(tmpParam))) {
            return cache.get(this.refId(tmpParam));
        }
        if (!cache.has(id)) {
            cache.set(id, new (instanceHost as ClassType)());
        }
        return this.findArgumentsForProvider(tmpParam as ClassType, manager, excluded, cache);
    }

    private getArgument(
        param: ProviderParam,
        manager: EntityManager,
        excluded: ExcludeType[],
        instanceHost: ProviderParam,
        cache: Map<string, any>
    ): any {
        let id: string;
        let tmpParam: string | ClassType;

        if (isString(param)) {
            id = param as string;
            tmpParam = param as string;
        } else if ((param as ClassType).name) {
            id = (param as ClassType).name;
            tmpParam = param as ClassType;
        } else if ((param as ForwardRef).forwardRef) {
            return this.resolveForwardRefArgument(param, instanceHost, manager, excluded, cache);
        }
        const isExcluded =
            excluded.length > 0 &&
            excluded.some((ex) => {
                if (isString(ex)) {
                    return ex === id;
                }
                return (ex as ClassType).name === id;
            });
        if (id === ModuleRef.name) {
            return TransactionService.moduleRef;
        }
        if (isExcluded) {
            /// Returns current instance of service, if it is excluded
            return TransactionService.moduleRef.get(tmpParam, { strict: false });
        }
        let argument: Repository<any>;
        if (cache.has(id)) {
            return cache.get(id);
        }
        const canBeRepository = id.includes('Repository');
        if (isString(tmpParam) || canBeRepository) {
            argument = this.getRepositoryArgument(canBeRepository, tmpParam, manager);
        } else {
            argument = this.findArgumentsForProvider(tmpParam as ClassType, manager, excluded, cache);
        }
        cache.set(id, argument);
        return argument;
    }

    private getRepositoryArgument(canBeRepository: boolean, tmpParam: string | ClassType, manager: EntityManager) {
        let dependency: Repository<any>;
        let isCustomRepository = false;
        try {
            if (canBeRepository) {
                tmpParam = isString(tmpParam)
                    ? TransactionService.moduleRef.get(tmpParam, { strict: false })
                    : tmpParam;
                dependency = manager.getCustomRepository(tmpParam as any);
                isCustomRepository = true;
            }
        } catch (error) {
            dependency = TransactionService.moduleRef.get(tmpParam, { strict: false });
        }
        const isRepository = (dependency instanceof Repository || canBeRepository) && !isCustomRepository;
        if (isRepository) {
            // If the dependency is a repository, make a new repository with the desired transaction manager.
            const entity: any = dependency.metadata.target;
            return manager.getRepository(entity);
        } else {
            // The dependency is not a repository, use it directly.
            return dependency;
        }
    }

    private findArgumentsForProvider(
        constructor: ClassType,
        manager: EntityManager,
        excluded: ExcludeType[],
        cache: Map<string, any>
    ) {
        const args: any[] = [];
        const keys = Reflect.getMetadataKeys(constructor);
        for (let key of keys) {
            if (key === PARAMTYPES_METADATA) {
                const paramTypes: Array<string | ClassType> = Reflect.getMetadata(key, constructor);
                for (const param of paramTypes) {
                    const argument = this.getArgument(param, manager, excluded, constructor, cache);
                    args.push(argument);
                }
            }
        }
        const cachedInstance = cache.get(this.refId(constructor));
        const resolvedInstance = new constructor(...args);
        if (cachedInstance) {
            Object.assign(cachedInstance, resolvedInstance);
            return cachedInstance;
        }

        return resolvedInstance;
    }
}
