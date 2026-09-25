import { ContractEquipEntity } from "@models/contingencyContract/entities/ContractEquipEntity.js";
import { ContractWeaponEntity } from "@models/contingencyContract/entities/ContractWeaponEntity.js";

export interface ContractCharEntity {
    id: string;
    level: number;
    potentialLevel: number;
    weapon: ContractWeaponEntity | null;
    equips: {
        bodyEquip: ContractEquipEntity | null;
        armEquip: ContractEquipEntity | null;
        firstAccessory: ContractEquipEntity | null;
        secondAccessory: ContractEquipEntity | null;
    };
}