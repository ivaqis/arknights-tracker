export interface ModerateContentResponse {
    error_code: number;
    rating_index?: number;
    rating_letter?: string;
    rating_label?: string;
    predictions?: {
        teen: number;
        everyone: number;
        adult: number;
    };
}
