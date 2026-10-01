import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";
import type { ITextableBlackboardEntry } from "$lib/classes/blackboard/ITextableBlackboardEntry";
import { TextableBlackboardEntry } from "$lib/classes/blackboard/TextableBlackboardEntry";
import type { IFoodBuff } from "$lib/classes/gameData/items/food/IFoodBuff";
import type { ReadonlyBbValueFormatMap } from "$lib/data/types/BbValueFormat";
import type { FoodBuffData } from "$lib/data/types/items/FoodData";

export class FoodBuff implements IFoodBuff {
    private readonly _buffId: string;
    private readonly _blackboard: readonly ITextableBlackboardEntry[];

    public constructor(buffId: string, blackboard: readonly ITextableBlackboardEntry[]) {
        this._buffId = buffId;
        this._blackboard = blackboard;
    }

    public static createFromData(data: FoodBuffData, formats?: ReadonlyBbValueFormatMap): FoodBuff {
        return new FoodBuff(
            data.buffId,
            FoodBuff.getBlackboard(data.blackboard, data.buffId, formats),
        );
    }

    private static getBlackboard(dataList: readonly IBlackboardEntry[], buffId: string, formats?: ReadonlyBbValueFormatMap): ITextableBlackboardEntry[] {
        return dataList.map(entry => new TextableBlackboardEntry(
            entry.key,
            entry.value,
            `buffs.${buffId}.${entry.key}`,
            `buffValues.${buffId}.${entry.key}`,
            formats?.[entry.key].display ?? true
        ));
    }

    public get blackboard(): readonly ITextableBlackboardEntry[] {
        return this._blackboard;
    }

    public get buffId(): string {
        return this._buffId;
    }

    public get i18nKey(): string {
        return `buffNames.${this._buffId}`;
    }

    public getBBEntry(key: string): ITextableBlackboardEntry | null {
        return this._blackboard.find(entry => entry.key === key) ?? null;
    }

    public hasBBEntry(key: string): boolean {
        return this._blackboard.some(entry => entry.key === key);
    }
}