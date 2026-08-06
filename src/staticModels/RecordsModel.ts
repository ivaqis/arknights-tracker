import { logger } from "@/logger";

export class RecordsModel<T extends object> {
    protected readonly _records = new Map<string, T>();

    private readonly _isValidFunc: (obj: T) => boolean;

    private readonly _name?: string;

    public constructor(list: T[],
                          getIdFunc: (obj: T) => string,
                          name?: string,
                          isValidFunc: (obj: T) => boolean = () => true
    ) {
        this._name = name;
        this._isValidFunc = isValidFunc;
        this.initRecords(list, getIdFunc);
    }

    public get(id: string): T | null {
        return this._records.get(id) ?? null;
    }

    public get name(): string | null {
        return this._name ?? null;
    }

    protected get namePrefix(): string {
        if (this.name) {
            return `[${this.name}] `;
        }

        return "";
    }

    protected isValid(obj: T): boolean {
        return this._isValidFunc(obj);
    }

    private initRecords(list: T[], getIdFunc: (obj: T) => string) {
        logger.debug(`${this.namePrefix}Initializing...`);

        const map = this._records;

        for (const item of list) {
            let key = getIdFunc(item);

            if (map.has(key)) {
                logger.warn(`${this.namePrefix}Key ${key} is already in map`);

                continue;
            }

            if (this.isValid(item)) {
                map.set(key, item);
            } else {
                logger.warn(`${this.namePrefix}Item is invalid:\n${item}`);
            }
        }

        logger.info(`${this.namePrefix}Initializing completed (${this._records.size})`);
    }
}