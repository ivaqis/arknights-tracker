export interface AchieveMedalEntity {
    id: string;
    name: string;
    level: number;
    isPlated?: boolean;
    obtainTs?: string;
}

export interface AchieveEntity {
    achieveMedals: AchieveMedalEntity[];
    display?: Record<string, string>;
    count?: number;
}

