export interface GemEntity {
    id: string;
    presetId: string;
    iconUrl: string;
    templateId?: string;
    termId?: string;
    name?: string;
    terms?: Array<{
        id: string;
        cost: number;
        name: string;
    }>;
    gemData?: {
        termId: string;
        name: string;
        templateId: string;
        icon: string;
    };
}