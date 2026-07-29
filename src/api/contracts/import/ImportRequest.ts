export interface ImportRequest {
    id: string | null;
    token: string;
    serverIds: string[];
    lastPullTs: number;
    share: boolean;
}