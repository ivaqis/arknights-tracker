import { GemData } from "@services/skportDetailFetcher/contracts/GemData";

export interface WeaponData {
    weaponData: {
        id: string;
        name: string;
    };
    level: number;
    refineLevel: number;
    breakthroughLevel: number;
    gem?: GemData
}