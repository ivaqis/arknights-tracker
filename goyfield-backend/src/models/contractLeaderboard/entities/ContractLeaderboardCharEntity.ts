import { ContractLeaderboardWeaponEntity } from "@models/contractLeaderboard/entities/ContractLeaderboardWeaponEntity.js";

export interface ContractLeaderboardCharEntity {
    id: string;
    level: number;
    potentialLevel: number;
    weapon: ContractLeaderboardWeaponEntity | null;
}