import { ValueTransformer } from 'typeorm';

export class UpdatedAtTimestampTransformer implements ValueTransformer {
    to() {
        return () => 'now()';
    }

    from(value) {
        if (!value) {
            return value;
        }
        return Math.round(+new Date(value) / 1000);
    }
}
