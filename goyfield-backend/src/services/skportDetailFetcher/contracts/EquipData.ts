export interface EquipData {
    equipId: string;
    equipData: {
        id: string;
        name: string;
        level?: {
            key: string;
            value: string;
        };
        baseAttrValue?: number;
        canEnhance?: boolean;
    };
    enhance?: Record<string, number>;
    canEnhance?: boolean;
}