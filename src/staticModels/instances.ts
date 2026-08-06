import banners from "@static/banners.json";
import bannerTypes from "@static/bannerTypes.json";
import charNames from "@static/charNames.json";
import crisisContracts from "@static/crisisContracts.json";
import equipNames from "@static/equipNames.json";
import gemPresetNames from "@static/gemPresetNames.json";
import weaponNames from "@static/weaponNames.json";
import tacticalItemNames from "@static/tacticalItemNames.json";
import contractNames from "@static/contractNames.json";
import monumentNames from "@static/monumentNames.json";
import monumentGroups from "@static/monumentGroups.json";
import { BannerRecords } from "@staticModels/banners/BannerRecords";
import { BannerTypeRecords } from "@staticModels/bannerTypes/BannerTypeRecords";
import { BannedWords } from "@staticModels/banwords/BannedWords";
import { CrisisContractRecords } from "@staticModels/crisisContracts/CrisisContractRecords";
import { ItemNameRecords } from "@staticModels/itemNames/ItemNameRecords";
import { MonumentGroupRecords } from "@staticModels/monument/MonumentGroupRecords";
import { TextList } from "@staticModels/TextList";

export const bannerRecords = new BannerRecords(banners);
export const bannerTypeRecords = new BannerTypeRecords(bannerTypes);

export const charNameRecords = new ItemNameRecords(charNames, "CharNameRecords");
export const weaponNameRecords = new ItemNameRecords(weaponNames, "WeaponNameRecords");
export const equipNameRecords = new ItemNameRecords(equipNames, "EquipNameRecords");
export const gemPresetNameRecords = new ItemNameRecords(gemPresetNames, "GemPresetNameRecords");
export const tacticalItemNameRecords = new ItemNameRecords(tacticalItemNames, "TacticalItemNameRecords");
export const contractNameRecords = new ItemNameRecords(contractNames, "ContractNameRecords");
export const monumentNameRecords = new ItemNameRecords(monumentNames, "MonumentNameRecords");

export const crisisContractRecords = new CrisisContractRecords(crisisContracts);

export const monumentGroupRecords = new MonumentGroupRecords(monumentGroups);

const banWordList = new TextList();
const banRootList = new TextList();

banWordList.addFromDir("static/banwords");
banRootList.addFromDir("static/banroots");

export const bannedWords = new BannedWords(banWordList.getList(), banRootList.getList());