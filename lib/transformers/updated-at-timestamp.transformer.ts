import { ValueTransformer } from 'typeorm';

export class UpdatedAtTimestampTransformer implements ValueTransformer {
    to() {
        return () => 'now()';
    }

    from(value: unknown) {
        if (!value) {
            return value;
        }
        return Math.round(+new Date(value as string | number | Date) / 1000);
    }
}
