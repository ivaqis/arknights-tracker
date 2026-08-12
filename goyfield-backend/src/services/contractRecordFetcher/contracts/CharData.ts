import { EquipData } from "@services/contractRecordFetcher/contracts/EquipData.js";
import { WeaponData } from "@services/contractRecordFetcher/contracts/WeaponData.js";

export interface CharData {
    charId: string;
    level: number;
    potentialLevel: number;
    weapon?: WeaponData;
    equips?: {
        bodyEquip?: EquipData;
        armEquip?: EquipData;
        firstAccessory?: EquipData;
        secondAccessory?: EquipData;
    }
}