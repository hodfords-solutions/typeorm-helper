import { DynamicModule, Module, ValueProvider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TransactionService } from './services/transaction.service';
import { EXCLUDED_OPTIONS } from './constants/excluded.constant';
import { ExcludeType } from './types/exclude.type';

@Module({})
export class TransactionModule {
    constructor(private moduleRef: ModuleRef) {
        TransactionService.moduleRef = moduleRef;
    }

    static forRoot(excluded: ExcludeType[] = []): DynamicModule {
        const excludedProviders: ValueProvider<ExcludeType[]> = {
            provide: EXCLUDED_OPTIONS,
            useValue: excluded
        };

        return {
            module: TransactionModule,
            providers: [excludedProviders],
            exports: []
        };
    }
}
