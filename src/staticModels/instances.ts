import { BannerRecords } from "@staticModels/banners/BannerRecords";
import banners from "@static/banners.json"
import itemNames from "@static/itemNames.json"
import { ItemNameRecords } from "@staticModels/itemNames/ItemNameRecords";

export const bannerRecords = new BannerRecords(banners);

export const itemNameRecords = new ItemNameRecords(itemNames);