import { CrafterMode } from "$lib/classes/gameData/buildings/crafters/CrafterMode";
import type { CrafterModeName } from "$lib/classes/gameData/buildings/crafters/CrafterModeName";
import type { ICrafterMode } from "$lib/classes/gameData/buildings/crafters/ICrafterMode";
import type { ICrafterModeGroup } from "$lib/classes/gameData/buildings/crafters/ICrafterModeGroup";
import type { CrafterModeData } from "$lib/data/types/buildings/CrafterModeData";

export class CrafterModeGroup implements ICrafterModeGroup {
    private readonly _formulaGroupId: string;
    private readonly _mode: ICrafterMode;

    public constructor(formulaGroupId: string, mode: ICrafterMode) {
        this._formulaGroupId = formulaGroupId;
        this._mode = mode;
    }

    public static createFromData(data: CrafterModeData): CrafterModeGroup {
        return new CrafterModeGroup(
            data.formulaGroupId,
            CrafterMode.get(data.modeName as CrafterModeName)
        );
    }

    public get formulaGroupId(): string {
        return this._formulaGroupId;
    }

    public get mode(): ICrafterMode {
        return this._mode;
    }
}