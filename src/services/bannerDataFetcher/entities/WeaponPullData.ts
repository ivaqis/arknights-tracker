import { PullData } from "@services/bannerDataFetcher/entities/PullData";

export interface WeaponPullData extends PullData {
    "weaponId": string,
    "weaponName": string,
    "weaponType": string
}