export interface CharacterData {
    id: string;
    name: string;
    rarity: number;
    element: string;
    class: string;
    weapon: string;
    birthDate: string;
    gameId: string;
    apiId: string | null;
}

declare const characters: Record<string, CharacterData>;