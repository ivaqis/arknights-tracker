export interface SyncImportResponse {
    profile: {
        publicId: string;
        privateId: string;
    } | null;
}