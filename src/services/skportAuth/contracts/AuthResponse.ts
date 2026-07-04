import { AuthData } from "@services/skportAuth/contracts/AuthData";

export interface AuthResponse {
    status: number,
    msg: string,
    type: string,
    data?: AuthData
}