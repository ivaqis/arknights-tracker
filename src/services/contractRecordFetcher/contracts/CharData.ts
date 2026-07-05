import { EquipData } from "@services/contractRecordFetcher/contracts/EquipData";
import { WeaponData } from "@services/contractRecordFetcher/contracts/WeaponData";

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