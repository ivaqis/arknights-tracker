import { RecordField } from "@database/records/recordFields/RecordField.js";

export class NullableStringRecordField extends RecordField<string | null> {
    public constructor(str: string | null) {
        super(str);
    }
}