export interface AttachContractVideoBody {
    recordId: string;
    videoUrl: string;
}

export interface AttachContractVideoResponse {
    success: boolean;
    videoUrl?: string;
}

