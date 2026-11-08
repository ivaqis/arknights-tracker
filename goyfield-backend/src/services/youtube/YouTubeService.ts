import { config } from "@/config.js";

export interface YouTubeValidationResult {
    valid: boolean;
    errorCode?: "INVALID_YOUTUBE_URL" | "YOUTUBE_API_KEY_MISSING" | "VIDEO_NOT_FOUND" | "TAG_NOT_FOUND" | "VIDEO_TOO_SHORT" | "VIDEO_TOO_LONG" | "FETCH_FAILED";
    videoId?: string;
    normalizedUrl?: string;
}

export class YouTubeService {
    public static parseVideoId(rawUrl: string): string | null {
        try {
            const url = new URL(rawUrl.trim());
            const hostname = url.hostname.toLowerCase();
            const validHosts = ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"];
            if (!validHosts.includes(hostname)) {
                return null;
            }

            let videoId: string | null = null;
            if (hostname === "youtu.be") {
                videoId = url.pathname.slice(1).split("/")[0] || null;
            } else if (url.pathname === "/watch") {
                videoId = url.searchParams.get("v");
            } else if (url.pathname.startsWith("/embed/")) {
                videoId = url.pathname.split("/")[2] || null;
            } else if (url.pathname.startsWith("/v/")) {
                videoId = url.pathname.split("/")[2] || null;
            } else if (url.pathname.startsWith("/shorts/")) {
                videoId = url.pathname.split("/")[2] || null;
            } else if (url.pathname.startsWith("/live/")) {
                videoId = url.pathname.split("/")[2] || null;
            }

            if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                return videoId;
            }
            return null;
        } catch {
            return null;
        }
    }

    public static parseDuration(isoDuration: string): number {
        const match = isoDuration.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/);
        if (!match) return 0;
        const days = parseInt(match[1] || "0", 10);
        const hours = parseInt(match[2] || "0", 10);
        const minutes = parseInt(match[3] || "0", 10);
        const seconds = parseInt(match[4] || "0", 10);
        return days * 86400 + hours * 3600 + minutes * 60 + seconds;
    }

    public static async validateVideo(rawUrl: string, expectedCode: string, clearTimeSec: number): Promise<YouTubeValidationResult> {
        const videoId = this.parseVideoId(rawUrl);
        if (!videoId) {
            return { valid: false, errorCode: "INVALID_YOUTUBE_URL" };
        }

        if (!config.youtubeApiKey) {
            return { valid: false, errorCode: "YOUTUBE_API_KEY_MISSING" };
        }

        try {
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(videoId)}&key=${encodeURIComponent(config.youtubeApiKey)}`;
            const res = await fetch(apiUrl);
            if (!res.ok) {
                return { valid: false, errorCode: "FETCH_FAILED" };
            }

            const data = await res.json() as any;
            const item = data?.items?.[0];
            if (!item) {
                return { valid: false, errorCode: "VIDEO_NOT_FOUND" };
            }

            const description: string = item.snippet?.description || "";
            const expectedTag = `#goyfield-${expectedCode.toLowerCase()}`;
            if (!description.toLowerCase().includes(expectedTag)) {
                return { valid: false, errorCode: "TAG_NOT_FOUND" };
            }

            const rawDuration: string = item.contentDetails?.duration || "";
            const durationSec = this.parseDuration(rawDuration);

            if (durationSec < clearTimeSec - 5) {
                return { valid: false, errorCode: "VIDEO_TOO_SHORT" };
            }

            if (durationSec > clearTimeSec + 120) {
                return { valid: false, errorCode: "VIDEO_TOO_LONG" };
            }

            return {
                valid: true,
                videoId,
                normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`
            };
        } catch {
            return { valid: false, errorCode: "FETCH_FAILED" };
        }
    }
}

