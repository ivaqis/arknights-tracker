import { CharData } from "@models/userProfileData/CharData";
import { ContractIndicator } from "@models/userProfileData/ContractIndicator";

export interface ContractRunData {
    id: string,
    level: number,
    clearTime: number,
    chars: CharData[],
    indicators: ContractIndicator[]
}