import { EquipData } from "@models/userProfileData/EquipData";
import { WeaponData } from "@models/userProfileData/WeaponData";

export interface CharData {
    id: string,
    level: number,
    potentialLevel: number,
    weapon?: WeaponData,
    equips: {
        bodyEquip?: EquipData,
        armEquip?: EquipData,
        firstAccessory?: EquipData,
        secondAccessory?: EquipData
    }
}