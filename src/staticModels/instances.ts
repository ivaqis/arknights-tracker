import banners from "@static/banners.json";
import charNames from "@static/charNames.json";
import crisisContracts from "@static/crisisContracts.json";
import equipNames from "@static/equipNames.json";
import gemPresetNames from "@static/gemPresetNames.json";
import weaponNames from "@static/weaponNames.json";
import tacticalItemNames from "@static/tacticalItemNames.json";
import { BannerRecords } from "@staticModels/banners/BannerRecords";
import { CrisisContractRecords } from "@staticModels/crisisContracts/CrisisContractRecords";
import { ItemNameRecords } from "@staticModels/itemNames/ItemNameRecords";

export const bannerRecords = new BannerRecords(banners);

export const charNameRecords = new ItemNameRecords(charNames, "CharNameRecords");
export const weaponNameRecords = new ItemNameRecords(weaponNames, "WeaponNameRecords");
export const equipNameRecords = new ItemNameRecords(equipNames, "EquipNameRecords");
export const gemPresetNameRecords = new ItemNameRecords(gemPresetNames, "GemPresetNameRecords");
export const tacticalItemNameRecords = new ItemNameRecords(tacticalItemNames, "TacticalItemNameRecords");

export const crisisContractRecords = new CrisisContractRecords(crisisContracts);