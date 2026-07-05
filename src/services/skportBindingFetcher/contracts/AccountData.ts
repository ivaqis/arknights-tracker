import { RoleData } from "@services/skportBindingFetcher/contracts/RoleData";

export interface AccountData {
    uid: string;
    isOfficial: boolean;
    isDefault: boolean;
    channelMasterId: string;
    channelName: string;
    nickName: string;
    isDelete: boolean;
    gameName: string;
    gameId: number;
    roles: RoleData[];
    defaultRole: RoleData
}
