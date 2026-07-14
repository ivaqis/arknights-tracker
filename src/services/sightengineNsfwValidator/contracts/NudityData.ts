export interface NudityData {
    sexual_activity: number;
    sexual_display: number;
    erotica: number;
    sextoy: number;
    suggestive: number;
    suggestive_classes: {
        bikini: number;
        cleavage: number;
        cleavage_categories: {
            very_revealing: number;
            revealing: number;
            none: number;
        };
        lingerie: number;
        male_chest: number;
        male_chest_categories: {
            very_revealing: number;
            revealing: number;
            slightly_revealing: number;
            none: number;
        };
        male_underwear: number;
        miniskirt: number;
        other: number;
    };
    none: number;
    context: {
        sea_lake_pool: number;
        outdoor_other: number;
        indoor_other: number;
    };
}