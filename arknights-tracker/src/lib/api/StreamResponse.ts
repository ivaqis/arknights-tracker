export interface StreamResponse<T> {
    type: string;
    message: string;
    data: T;
}