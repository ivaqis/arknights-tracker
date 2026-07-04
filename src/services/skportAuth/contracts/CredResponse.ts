import { CredData } from "@services/skportAuth/contracts/CredData";

export interface CredResponse {
    code: number,
    message: string,
    timestamp: string,
    data?: CredData
}