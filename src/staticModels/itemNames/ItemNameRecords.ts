import { ItemNameEntity } from "@staticModels/itemNames/ItemNameEntity";

export class ItemNameRecords {
    private readonly _itemId2ItemName = new Map<string, string>;
    private readonly _itemName2ItemId = new Map<string, string>;

    public constructor(list: ItemNameEntity[]) {
        for (const item of list) {
            this._itemId2ItemName.set(item.id, item.name);
            this._itemName2ItemId.set(item.name, item.id);
        }
    }

    public getItemName(id: string): string | null {
        return this._itemId2ItemName.get(id)
            ?? null;
    }

    public getItemId(name: string): string | null {
        return this._itemName2ItemId.get(name)
            ?? null;
    }
}