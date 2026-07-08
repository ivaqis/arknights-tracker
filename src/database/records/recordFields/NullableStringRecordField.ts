import { RecordField } from "@database/records/recordFields/RecordField";

export class NullableStringRecordField extends RecordField<string | null> {
    public constructor(str: string | null) {
        super(str);
    }
}