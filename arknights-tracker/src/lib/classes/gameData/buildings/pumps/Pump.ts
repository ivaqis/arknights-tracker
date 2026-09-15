import { Building } from "$lib/classes/gameData/buildings/Building";
import type { BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IEnableLiquid } from "$lib/classes/gameData/buildings/pumps/IEnableLiquid";
import type { IPump } from "$lib/classes/gameData/buildings/pumps/IPump";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import type { IPumpRecipe } from "$lib/classes/gameData/recipes/IPumpRecipe";
import { PumpRecipe } from "$lib/classes/gameData/recipes/PumpRecipe";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";
import { getMap } from "$lib/utils/collectionUtils";

export class Pump extends Building implements IPump {
    private readonly _pumpTimeMs: number;
    private readonly _enableLiquids: readonly IEnableLiquid[];
    private readonly _enableLiquidMap: Map<string, IEnableLiquid>;

    public constructor(id: string, gameId: string, type: BuildingType, item: IItem, icon: IImageIcon, pumpTimeMs: number, enableLiquids: readonly IEnableLiquid[]) {
        super(id, gameId, type, item, icon);

        this._pumpTimeMs = pumpTimeMs;
        this._enableLiquids = enableLiquids;
        this._enableLiquidMap = getMap(enableLiquids, item => item.item.gameId);
    }

    public static createFromBuilding(building: IBuilding, pumpTimeMs: number, enableLiquids: readonly IEnableLiquid[]): Pump {
        return new Pump(
            building.id,
            building.gameId,
            building.type,
            building.item,
            building.icon,
            pumpTimeMs,
            enableLiquids
        );
    }

    public get enableLiquids(): readonly IEnableLiquid[] {
        return this._enableLiquids;
    }

    public get pumpTimeMs(): number {
        return this._pumpTimeMs;
    }

    public getRecipe(liquidId: string): IPumpRecipe | null {
        const liquid = this.getEnableLiquid(liquidId);

        if (!liquid || !liquid.resourcePoint) {
            return null;
        }

        const outcomes: IItemStack[] = [
            {
                item: liquid.item,
                count: 1
            }
        ];

        return new PumpRecipe(
            [],
            outcomes,
            this,
            this._pumpTimeMs,
            liquid.resourcePoint
        );
    }

    public isLiquidEnable(liquidId: string): boolean {
        return this._enableLiquidMap.has(liquidId);
    }

    public getEnableLiquid(liquidId: string): IEnableLiquid | null {
        return this._enableLiquidMap.get(liquidId) ?? null;
    }
}