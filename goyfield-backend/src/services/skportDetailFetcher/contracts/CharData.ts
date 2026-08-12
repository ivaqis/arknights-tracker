import { EquipData } from "@services/skportDetailFetcher/contracts/EquipData.js";
import { SkillData } from "@services/skportDetailFetcher/contracts/SkillData.js";
import { UserSkillData } from "@services/skportDetailFetcher/contracts/UserSkillData.js";
import { TacticalItemData } from "@services/skportDetailFetcher/contracts/TacticalItemData.js";
import { WeaponData } from "@services/skportDetailFetcher/contracts/WeaponData.js";

export interface CharData {
    charData: {
        id: string;
        name: string;
        skills: SkillData[];
    };
    id: string;
    level: number;
    userSkills: Record<string, UserSkillData>;
    bodyEquip?: EquipData;
    armEquip?: EquipData;
    firstAccessory?: EquipData;
    secondAccessory?: EquipData;
    tacticalItem?: TacticalItemData;
    evolvePhase: number;
    potentialLevel: number;
    weapon: WeaponData;
    ownTs: string;
    talent: {
        latestBreakNode: string;
        attrNodes: string[];
        latestPassiveSkillNodes: string[];
        latestFactorySkillNodes: string[];
        latestSpaceshipSkillNodes: string[];
    };
}