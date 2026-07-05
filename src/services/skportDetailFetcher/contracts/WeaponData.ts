export interface WeaponData {
    weaponData: {
        id: string;
        name: string;
    };
    level: number;
    refineLevel: number;
    breakthroughLevel: number;
    gem?: {
        id: string;
        gemData: {
            termId: string;
            name: string;
            templateId: string;
        }
    }
}