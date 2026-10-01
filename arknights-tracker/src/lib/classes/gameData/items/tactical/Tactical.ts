import type { IBlackboardEntry } from "$lib/classes/blackboard/IBlackboardEntry";
import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
import type { ITactical } from "$lib/classes/gameData/items/tactical/ITactical";
import type { EquipableItemData } from "$lib/data/types/items/EquipableItemData";
import type { LocalizationFn } from "$lib/i18n";

export class Tactical implements ITactical {
    private static readonly PERCENT_FORMATTER = this.getPercentFormatter();

    private readonly _condType: EquipableItemConditionType;
    private readonly _condParams: readonly string[];
    private readonly _castTime: number;
    private readonly _castCount: number;
    private readonly _castToMainCount: number;
    private readonly _cooldown: number;
    private readonly _recoverTime: number;
    private readonly _recoverUpperCount: number;
    private readonly _levelUpCastCount: number;
    private readonly _levelUpRecoverUpperCount: number;

    public constructor(condType: EquipableItemConditionType, condParams: readonly string[], castTime: number, castCount: number, castToMainCount: number, cooldown: number, recoverTime: number, recoverUpperCount: number, levelUpCastCount: number, levelUpRecoverUpperCount: number) {
        this._condType = condType;
        this._condParams = condParams;
        this._castTime = castTime;
        this._castCount = castCount;
        this._castToMainCount = castToMainCount;
        this._cooldown = cooldown;
        this._recoverTime = recoverTime;
        this._recoverUpperCount = recoverUpperCount;
        this._levelUpCastCount = levelUpCastCount;
        this._levelUpRecoverUpperCount = levelUpRecoverUpperCount;
    }

    public static createFromData(data: EquipableItemData): Tactical {
        return new Tactical(
            data.condType as EquipableItemConditionType,
            data.condParams,
            data.castTime,
            data.castCount,
            data.castToMainCount,
            data.cooldown,
            data.recoverTime,
            data.recoverUpperCount,
            data.levelUpCastCount,
            data.levelUpRecoverUpperCount,
        );
    }

    private static getPercentFormatter() {
        return new Intl.NumberFormat("en-US", {
            style: "percent",
            maximumFractionDigits: 0,
        });
    }

    public get condType(): EquipableItemConditionType {
        return this._condType;
    }

    public get condParams(): readonly string[] {
        return this._condParams;
    }

    public get castTime(): number {
        return this._castTime;
    }

    public get castCount(): number {
        return this._castCount;
    }

    public get castToMainCount(): number {
        return this._castToMainCount;
    }

    public get cooldown(): number {
        return this._cooldown;
    }

    public get recoverTime(): number {
        return this._recoverTime;
    }

    public get recoverUpperCount(): number {
        return this._recoverUpperCount;
    }

    public get levelUpCastCount(): number {
        return this._levelUpCastCount;
    }

    public get levelUpRecoverUpperCount(): number {
        return this._levelUpRecoverUpperCount;
    }

    public getValue(key: string): number {
        switch (key) {
            case "count": return this._castCount;
            case "param1": return Number(this._condParams[0]);
            case "param2": return Number(this._condParams[1]);
        }

        throw new Error(`Unexpected key ${key}`);
    }

    public getDetailList(textFn: LocalizationFn): IBlackboardEntry<string>[] {
        return [
            this.getCondTypeFormatted(textFn),
            ...this.getCondParamsFormatted(textFn),
            this.getCastTimeFormatted(textFn),
            this.getCastCountFormatted(textFn),
            this.getCastToMainCountFormatted(textFn),
            this.getCooldownFormatted(textFn),
            this.getRecoverTimeFormatted(textFn),
            this.getRecoverUpperCountFormatted(textFn),
        ];
    }

    public formatCastCount(textFn: LocalizationFn): string {
        if (this._castCount === 0) {
            return textFn("tacticalZero.castCount");
        }

        return textFn("tacticalValues.castCount", { value: this._castCount });
    }

    public formatCastTime(textFn: LocalizationFn): string {
        return textFn("tacticalValues.castTime", { value: this._castTime });
    }

    public formatCastToMainCount(textFn: LocalizationFn): string {
        if (this._castToMainCount === 0) {
            return textFn("tacticalZero.castToMainCount");
        }

        return textFn("tacticalValues.castToMainCount", { value: this._castToMainCount });
    }

    public formatCondType(textFn: LocalizationFn): string {
        return textFn(`tacticalCondType.${this._condType}`);
    }

    public formatCooldown(textFn: LocalizationFn): string {
        if (this._cooldown === 0) {
            return textFn("tacticalZero.cooldown");
        }

        return textFn("tacticalValues.cooldown", { value: this._cooldown });
    }

    public formatRecoverTime(textFn: LocalizationFn): string {
        if (this._recoverTime === 0) {
            return textFn("tacticalZero.recoverTime");
        }

        return textFn("tacticalValues.recoverTime", { value: this._recoverTime });
    }

    public formatRecoverUpperCount(textFn: LocalizationFn): string {
        if (this._recoverUpperCount === 0) {
            return textFn("tacticalZero.recoverUpperCount");
        }

        return textFn("tacticalValues.recoverUpperCount", { value: this._recoverUpperCount });
    }

    private getCondTypeFormatted(textFn: LocalizationFn): IBlackboardEntry<string> {
        const title = textFn("tacticalTitle.condType");
        const value = this.formatCondType(textFn);

        return {
            key: title,
            value
        };
    }

    private getCondParamsFormatted(textFn: LocalizationFn): IBlackboardEntry<string>[] {
        const formatter = Tactical.PERCENT_FORMATTER;

        if (this._condType === EquipableItemConditionType.CHAR_HP || this._condType === EquipableItemConditionType.ULT_ENERGY) {
            return [
                {
                    key: textFn(`tacticalCondParamTitle.${this._condType}.param2`),
                    value: textFn(`tacticalCondParam.${this._condType}.param2.${this._condParams[1]}`),
                },
                {
                    key: textFn(`tacticalCondParamTitle.${this._condType}.param1`),
                    value: formatter.format(Number(this._condParams[0]))
                },

            ];
        }

        if (this._condType === EquipableItemConditionType.DAMAGE_TAKEN) {
            return [
                {
                    key: textFn(`tacticalCondParamTitle.${this._condType}.param1`),
                    value: textFn(`tacticalCondParam.${this._condType}.param1.${this._condParams[0]}`)
                },
                {
                    key: textFn(`tacticalCondParamTitle.${this._condType}.param2`),
                    value: formatter.format(Number(this._condParams[1]))
                }
            ];
        }

        return [];
    }

    private getCastTimeFormatted(textFn: LocalizationFn): IBlackboardEntry<string> {
        return {
            key: textFn("tacticalTitle.castTime"),
            value: this.formatCastTime(textFn)
        };
    }

    private getCastCountFormatted(textFn: LocalizationFn): IBlackboardEntry<string> {
        let value = this.formatCastCount(textFn);

        return {
            key: textFn("tacticalTitle.castCount"),
            value: value
        };
    }

    private getCastToMainCountFormatted(textFn: LocalizationFn): IBlackboardEntry<string> {
        let value = this.formatCastToMainCount(textFn);

        return {
            key: textFn("tacticalTitle.castToMainCount"),
            value: value
        };
    }

    private getCooldownFormatted(textFn: LocalizationFn): IBlackboardEntry<string> {
        let value = this.formatCooldown(textFn);

        return {
            key: textFn("tacticalTitle.cooldown"),
            value: value
        };
    }

    private getRecoverTimeFormatted(textFn: LocalizationFn): IBlackboardEntry<string> {
        let value = this.formatRecoverTime(textFn);

        return {
            key: textFn("tacticalTitle.recoverTime"),
            value: value
        };
    }

    private getRecoverUpperCountFormatted(textFn: LocalizationFn): IBlackboardEntry<string> {
        let value = this.formatRecoverUpperCount(textFn);

        return {
            key: textFn("tacticalTitle.recoverUpperCount"),
            value: value
        };
    }
}