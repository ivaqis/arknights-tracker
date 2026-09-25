export interface MonumentCharData {
    charId: string;
    level: number;
    potentialLevel: number;
    avatarUrl: string;
    evolvePhase: number;
    property: {
        key: string;
        value: string
    };
    rarity: {
        key: string;
        value: string
    };
}