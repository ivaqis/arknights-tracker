export interface ImportErrorEntity {
    id: number,
    createdAt: Date,
    url: string,
    message: string,
    stack?: string,
    serverId?: string,
    solved: boolean
}