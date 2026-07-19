import { MonumentLeaderboardWeaponEntity } from "@models/monumentLeaderboard/entities/MonumentLeaderboardWeaponEntity";

export interface MonumentLeaderboardCharEntity {
    id: string;
    level: number;
    potentialLevel: number;
    weapon: MonumentLeaderboardWeaponEntity | null;
}