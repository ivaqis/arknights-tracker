import { RecordField } from "@database/records/recordFields/RecordField.js";

export class BooleanRecordField extends RecordField<boolean> {
    public constructor(bool: boolean) {
        super(bool);
    }
}