import { RecordField } from "@database/records/recordFields/RecordField";

export class StringRecordField extends RecordField<string> {
    public constructor(str: string) {
        super(str);
    }
}