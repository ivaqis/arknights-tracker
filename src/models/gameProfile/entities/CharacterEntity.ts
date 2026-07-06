import { CharSkillEntity } from "@models/gameProfile/entities/CharSkillEntity";
import { EquipEntity } from "@models/gameProfile/entities/EquipEntity";
import { TacticalItemEntity } from "@models/gameProfile/entities/TacticalItemEntity";
import { TalentEntity } from "@models/gameProfile/entities/TalentEntity";
import { WeaponEntity } from "@models/gameProfile/entities/WeaponEntity";

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
}