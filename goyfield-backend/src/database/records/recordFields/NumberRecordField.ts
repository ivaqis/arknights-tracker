import { RecordField } from "@database/records/recordFields/RecordField.js";

export class NumberRecordField extends RecordField<number> {
    public constructor(number: number) {
        super(number);
    }

    public get delta(): number {
        return this.value - this.initValue;
    }
}