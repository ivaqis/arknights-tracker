import { RecordField } from "@database/records/recordFields/RecordField.js";

export class NullableBigIntRecordField extends RecordField<bigint | null> {

    public constructor(initValue: bigint | null) {
        super(initValue);
    }

    public get delta(): bigint | null {
        if (this.value === null || this.initValue === null) {
            return null;
        }

        return this.value - this.initValue;
    }
}