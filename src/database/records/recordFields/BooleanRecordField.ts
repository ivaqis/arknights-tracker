import { RecordField } from "@database/records/recordFields/RecordField";

export class BooleanRecordField extends RecordField<boolean> {
    public constructor(bool: boolean) {
        super(bool);
    }
}