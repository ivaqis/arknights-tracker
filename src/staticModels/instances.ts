import banners from "@static/banners.json" with { type: "json" };
import bannerTypes from "@static/bannerTypes.json" with { type: "json" };
import charNames from "@static/charNames.json" with { type: "json" };
import contractNames from "@static/contractNames.json" with { type: "json" };
import crisisContracts from "@static/crisisContracts.json" with { type: "json" };
import equipNames from "@static/equipNames.json" with { type: "json" };
import gemPresetNames from "@static/gemPresetNames.json" with { type: "json" };
import monumentGroups from "@static/monumentGroups.json" with { type: "json" };
import monumentNames from "@static/monumentNames.json" with { type: "json" };
import tacticalItemNames from "@static/tacticalItemNames.json" with { type: "json" };
import weaponNames from "@static/weaponNames.json" with { type: "json" };
import { BannerRecords } from "@staticModels/banners/BannerRecords.js";
import { BannerTypeRecords } from "@staticModels/bannerTypes/BannerTypeRecords.js";
import { BannedWords } from "@staticModels/banwords/BannedWords.js";
import { CrisisContractRecords } from "@staticModels/crisisContracts/CrisisContractRecords.js";
import { ItemNameRecords } from "@staticModels/itemNames/ItemNameRecords.js";
import { MonumentGroupRecords } from "@staticModels/monument/MonumentGroupRecords.js";
import { TextList } from "@staticModels/TextList.js";

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