export interface WeaponData {
    readonly id: string;
    readonly gameId: string;
    readonly name: string;
    readonly rarity: number;
    readonly weapon: string;
    readonly skills: readonly string[];
}

declare const weapons: Record<string, WeaponData>;