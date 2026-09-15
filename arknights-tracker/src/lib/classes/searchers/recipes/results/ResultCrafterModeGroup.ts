import type { ICrafter } from "$lib/classes/gameData/buildings/crafters/ICrafter";
import type { ICrafterModeGroup } from "$lib/classes/gameData/buildings/crafters/ICrafterModeGroup";
import type { IMachineCraft } from "$lib/classes/gameData/recipes/IMachineCraft";
import type { IResultCrafterModeGroup } from "$lib/classes/searchers/recipes/results/IResultCrafterModeGroup";
import { ResultBuildingGroup } from "$lib/classes/searchers/recipes/results/ResultBuildingGroup";

export class ResultCrafterModeGroup
    extends ResultBuildingGroup<ICrafter, IMachineCraft>
    implements IResultCrafterModeGroup {

    private readonly _mode: ICrafterModeGroup;

    public constructor(building: ICrafter, list: IMachineCraft[], mode: ICrafterModeGroup) {
        super(building, list);

        this._mode = mode;
    }

    public get mode(): ICrafterModeGroup {
        return this._mode;
    }
}