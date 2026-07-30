export class TimelineDate {
    public static readonly REGEX = /^\d{4}-\d{2}-\d{2}$/;

    private readonly _year: number;
    private readonly _month: number;
    private readonly _day: number;

    private constructor(year: number, month: number, day: number) {
        this._year = year;
        this._month = month;
        this._day = day;
    }

    public static create(year: number, month: number, day: number): TimelineDate {
        const ts = Date.UTC(year, month - 1, day);

        return this.createFromTs(ts);
    }

    public static createFromTs(ts: number): TimelineDate {
        const date = new Date(ts);

        return new TimelineDate(
            date.getUTCFullYear(),
            date.getUTCMonth() + 1,
            date.getUTCDate()
        );
    }

    public static parse(date: string): TimelineDate | null {
        const isValid = this.REGEX.test(date);

        if (!isValid) {
            return null;
        }

        const parts = date.split("-");

        return this.create(
            parseInt(parts[0], 10),
            parseInt(parts[1], 10),
            parseInt(parts[2], 10)
        );
    }

    public toString(): string {
        return `${this.year}-${this.month >= 10 ? this.month : `0${this.month}`}-${this.day >= 10 ? this.day : `0${this.day}`}`;
    }

    public get year(): number {
        return this._year;
    }

    public get month(): number {
        return this._month;
    }

    public get day(): number {
        return this._day;
    }
}