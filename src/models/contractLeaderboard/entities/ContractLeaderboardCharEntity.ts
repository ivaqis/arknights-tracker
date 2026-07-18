import { ContractLeaderboardWeaponEntity } from "@models/contractLeaderboard/entities/ContractLeaderboardWeaponEntity";

export interface ContractLeaderboardCharEntity {
    id: string;
    level: number;
    potentialLevel: number;
    weapon: ContractLeaderboardWeaponEntity | null;
}