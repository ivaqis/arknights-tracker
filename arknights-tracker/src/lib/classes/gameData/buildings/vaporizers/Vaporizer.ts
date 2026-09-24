import { Building } from "$lib/classes/gameData/buildings/Building";
import { type BuildingType } from "$lib/classes/gameData/buildings/BuildingType";
import type { IBuilding } from "$lib/classes/gameData/buildings/IBuilding";
import type { IVaporizer } from "$lib/classes/gameData/buildings/vaporizers/IVaporizer";
import type { IVaporizerGroup } from "$lib/classes/gameData/buildings/vaporizers/IVaporizerGroup";
import type { IItem } from "$lib/classes/gameData/items/IItem";
import type { IItemStack } from "$lib/classes/gameData/items/IItemStack";
import { GasEnvRecipe } from "$lib/classes/gameData/recipes/GasEnvRecipe";
import type { IGasEnvRecipe } from "$lib/classes/gameData/recipes/IGasEnvRecipe";
import type { IImageIcon } from "$lib/classes/icons/IImageIcon";

export class Vaporizer extends Building implements IVaporizer {
    private readonly _groups: readonly IVaporizerGroup[];

    public constructor(id: string, gameId: string, type: BuildingType, item: IItem, icon: IImageIcon, groups: readonly IVaporizerGroup[]) {
        super(id, gameId, type, item, icon);

        this._groups = groups;
    }

    public static createFromBuilding(building: IBuilding, groups: readonly IVaporizerGroup[]): Vaporizer {
        return new Vaporizer(
            building.id,
            building.gameId,
            building.type,
            building.item,
            building.icon,
            groups,
        )
    }

    public get groups(): readonly IVaporizerGroup[] {
        return this._groups;
    }

    public getGroupByEnv(gasEnvId: string): IVaporizerGroup | null {
        return this._groups.find(env => env.gasEnv.id === gasEnvId) ?? null;
    }

    public getGroupByItem(itemId: string): IVaporizerGroup | null {
        return this._groups.find(env => env.consumeItem.gameId === itemId) ?? null;
    }

    public getGasEnvRecipe(gasEnvId: string): IGasEnvRecipe | null {
        const group = this.getGroupByEnv(gasEnvId);

        if (!group) {
            return null;
        }

        const ingredients: IItemStack[] = [
            {
                item: group.consumeItem,
                count: 1
            }
        ];
        const time = 60000 / group.consumeRate;

        return new GasEnvRecipe(
            ingredients,
            this,
            time,
            group.gasEnv
        );
    }
}