import { logger } from "@/logger";
import { ItemNameEntity } from "@staticModels/itemNames/ItemNameEntity";

export class ItemNameRecords {
    private readonly _id2Name = new Map<string, string>();
    private readonly _name2Id = new Map<string, string>();

    private readonly _name?: string;

    public constructor(list: ItemNameEntity[], name?: string) {
        this._name = name;

        this.initialize(list);
    }

    private get id2NameSize() {
        return this._id2Name.size;
    }

    private get name2IdSize() {
        return this._name2Id.size;
    }

    private get namePrefix() {
        if (this._name) {
            return `[${this._name}] `;
        }

        return "";
    }

    public getName(id: string): string | undefined {
        return this._id2Name.get(id);
    }

    public getId(name: string): string | undefined {
        return this._name2Id.get(name);
    }

    protected initialize(list: ItemNameEntity[]) {
        logger.debug(`${this.namePrefix}Initializing...`);

        this.initMap(
            this._id2Name,
            list,
            item => item.id,
            item => item.name
        );

        this.initMap(
            this._name2Id,
            list,
            item => item.name,
            item => item.id
        );

        logger.info(`${this.namePrefix}Initializing completed (ids: ${this.id2NameSize} / names: ${this.name2IdSize})`);
    }

    private initMap(map: Map<string, string>,
                    list: ItemNameEntity[],
                    getKey: (entity: ItemNameEntity) => string,
                    getValue: (entity: ItemNameEntity) => string
    ) {
        for (const item of list) {
            let key = getKey(item);
            let value = getValue(item);

            if (map.has(key)) {
                logger.warn(`${this.namePrefix}Key "${key}" is already in map`);
                continue;
            }

            map.set(key, value);
        }
    }
}