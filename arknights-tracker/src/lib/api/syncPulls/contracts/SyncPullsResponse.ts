export interface SyncPullsResponse {
    profile: {
        publicId: string;
        privateId: string;
    } | null;
}