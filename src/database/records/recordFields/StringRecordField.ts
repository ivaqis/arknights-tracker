import { RecordField } from "@database/records/recordFields/RecordField.js";

export class StringRecordField extends RecordField<string> {
    public constructor(str: string) {
        super(str);
    }
}