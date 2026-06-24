import { PullEntity } from "@services/bannerDataFetcher/entities/PullEntity";

export interface CharPullEntity extends PullEntity {
    "charId": string,
    "charName": string,
    "isFree": boolean
}