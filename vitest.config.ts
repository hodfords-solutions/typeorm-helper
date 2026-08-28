import { fileURLToPath } from 'node:url';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        swc.vite({
            module: { type: 'es6' },
            jsc: {
                target: 'es2023',
                parser: { syntax: 'typescript', decorators: true },
                transform: { legacyDecorator: true, decoratorMetadata: true }
            }
        })
    ],
    resolve: {
        alias: {
            '@hodfords/typeorm-helper': fileURLToPath(new URL('./lib/index.ts', import.meta.url))
        }
    },
    test: {
        globals: true,
        environment: 'node',
        include: ['{tests,test,lib,src}/**/*.{spec,test}.ts'],
        setupFiles: ['./vitest.setup.ts'],
        testTimeout: 450_000,
        passWithNoTests: true,
        fileParallelism: false,
        maxWorkers: 1,
        minWorkers: 1,
        coverage: { provider: 'v8', reporter: ['text', 'lcov'], include: ['lib/**/*.ts'] }
    }
});
