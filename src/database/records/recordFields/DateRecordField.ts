import { RecordField } from "@database/records/recordFields/RecordField";

export class DateRecordField extends RecordField<Date> {
    public constructor(date: Date) {
        super(date);
    }
}