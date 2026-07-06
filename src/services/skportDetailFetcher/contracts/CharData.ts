import { EquipData } from "@services/skportDetailFetcher/contracts/EquipData";
import { SkillData } from "@services/skportDetailFetcher/contracts/SkillData";
import { UserSkillData } from "@services/skportDetailFetcher/contracts/UserSkillData";
import { TacticalItemData } from "@services/skportDetailFetcher/contracts/TacticalItemData";
import { WeaponData } from "@services/skportDetailFetcher/contracts/WeaponData";

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