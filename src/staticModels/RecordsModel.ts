export abstract class RecordsModel<T> {
    protected readonly _records: Record<string, T>;

    protected constructor(list: T[], getIdFunc: (obj: T) => string) {
        this._records = this.getRecords(list, getIdFunc);
    }

    public get(id: string): T | null {
        return this._records[id] ?? null;
    }

    protected abstract isValid(obj: T): boolean;

    private getRecords(list: T[], getIdFunc: (obj: T) => string): Record<string, T> {
        let result: Record<string, T> = {};

        for (const item of list) {
            if (this.isValid(item)) {
                result[getIdFunc(item)] = item;
            }
        }

        return result;
    }
}