import { AccountData } from "@services/skportBindingFetcher/contracts/AccountData.js";

export interface GameData {
    appCode: string,
    appName: string,
    bindingList: AccountData[]
}