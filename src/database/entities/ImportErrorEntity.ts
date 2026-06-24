export interface ImportErrorEntity {
    id: number,
    createdAt: Date,
    url: string,
    error: string,
    stack?: string,
    serverId?: string,
    solved: boolean
}