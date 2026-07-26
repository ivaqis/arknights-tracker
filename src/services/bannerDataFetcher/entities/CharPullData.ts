import { PullData } from "@services/bannerDataFetcher/entities/PullData";

export interface CharPullData extends PullData {
    "charId": string,
    "charName": string,
    "isFree": boolean
}