export interface EquipEntity {
    id: string;
    level?: number;
    enhanceStatus?: number;
    enhance?: Record<string, number>;
    name?: string;
}