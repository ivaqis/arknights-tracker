import { PullData } from "@services/bannerDataFetcher/entities/PullData.js";

export interface WeaponPullData extends PullData {
    "weaponId": string,
    "weaponName": string,
    "weaponType": string
}