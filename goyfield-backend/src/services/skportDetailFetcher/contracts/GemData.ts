export interface GemData {
    id: string;
    gemData: {
        termId: string;
        name: string;
        templateId: string;
        icon: string;
    };
    terms?: Array<{
        id: string;
        cost: number;
        name: string;
    }>;
}