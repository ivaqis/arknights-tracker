import { PullEntity } from "@services/bannerDataFetcher/entities/PullEntity";

export interface WeaponPullEntity extends PullEntity {
    "weaponId": string,
    "weaponName": string,
    "weaponType": string
}