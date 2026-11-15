export interface PostImportRequest {
    privateId: string | null;
    recovery?: boolean;
    lastPulls?: Record<string, number>;
}