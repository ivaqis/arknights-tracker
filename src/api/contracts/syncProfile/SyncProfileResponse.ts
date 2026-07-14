import { IGameProfile } from "@api/contracts/userProfile/IGameProfile";

export interface SyncProfileResponse {
    gameProfiles: IGameProfile[];
}