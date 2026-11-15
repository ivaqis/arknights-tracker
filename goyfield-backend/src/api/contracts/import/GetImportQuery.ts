export interface GetImportQuery {
    token: string;
    serverIds: string;
    lastPullTs?: string;
    lastPulls?: string;
}