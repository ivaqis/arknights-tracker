import { RecordField } from "@database/records/recordFields/RecordField.js";

export class BigIntRecordField extends RecordField<bigint> {
    public constructor(number: bigint) {
        super(number);
    }

    public get delta(): bigint {
        return this.value - this.initValue;
    }
}