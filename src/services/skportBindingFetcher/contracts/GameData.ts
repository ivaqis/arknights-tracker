import { AccountData } from "@services/skportBindingFetcher/contracts/AccountData";

export interface GameData {
    appCode: string,
    appName: string,
    bindingList: AccountData[]
}