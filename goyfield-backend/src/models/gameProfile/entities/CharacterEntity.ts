import { CharSkillEntity } from "@models/gameProfile/entities/CharSkillEntity.js";
import { EquipEntity } from "@models/gameProfile/entities/EquipEntity.js";
import { TacticalItemEntity } from "@models/gameProfile/entities/TacticalItemEntity.js";
import { TalentEntity } from "@models/gameProfile/entities/TalentEntity.js";
import { WeaponEntity } from "@models/gameProfile/entities/WeaponEntity.js";

export interface CharacterEntity {
    id: string;
    level: number;
    potentialLevel: number;
    ownTs: string;
    skills: CharSkillEntity[];
    bodyEquip: EquipEntity | null;
    armEquip: EquipEntity | null;
    firstAccessory: EquipEntity | null;
    secondAccessory: EquipEntity | null;
    tacticalItem: TacticalItemEntity | null;
    weapon: WeaponEntity | null;
    talent: TalentEntity;
    apiId: string;
}