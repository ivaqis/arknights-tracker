import { RecordField } from "@database/records/recordFields/RecordField.js";

export class DateRecordField extends RecordField<Date> {
    public constructor(date: Date) {
        super(date);
    }
}