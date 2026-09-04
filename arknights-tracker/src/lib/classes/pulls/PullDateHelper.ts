import { banners, type BannerData } from "$lib/data/banners";

export type DateLike = Date | string | number;

export class PullDateHelper {
    public static readonly BUFFER_MS = 4 * 60 * 60 * 1000;

    public static sortPulls(
        a: { time: DateLike; seqId?: number },
        b: { time: DateLike; seqId?: number }
    ): number {
        const timeA = (a.time instanceof Date) ? a.time.getTime() : new Date(a.time).getTime();
        const timeB = (b.time instanceof Date) ? b.time.getTime() : new Date(b.time).getTime();
        const timeDiff = timeA - timeB;
        if (timeDiff !== 0) return timeDiff;
        return (a.seqId || 0) - (b.seqId || 0);
    }

    public static resolveServerId(specificServerId?: string | null): string {
        let sid = specificServerId;
        if (!sid && typeof window !== "undefined") {
            sid = localStorage.getItem("ark_server_id");
        }
        return String(sid || "3");
    }

    public static getServerOffset(specificServerId?: string | null): number {
        const sid = this.resolveServerId(specificServerId);
        return sid === "2" ? 8 : -5;
    }

    public static getBannerDates(
        banner: BannerData | null | undefined,
        specificServerId?: string | null
    ): { startStr: string | null; endStr: string | null } {
        if (!banner) {
            return { startStr: null, endStr: null };
        }
        const sid = this.resolveServerId(specificServerId);
        const isAsia = sid === "2";
        const startStr = (isAsia && banner.startTimeAsia) ? banner.startTimeAsia : banner.startTime;
        const endStr = (isAsia && banner.endTimeAsia) ? banner.endTimeAsia : banner.endTime;
        return { startStr, endStr };
    }

    public static parseTimestamp(raw: DateLike | null | undefined): Date {
        if (!raw) return new Date(0);
        if (raw instanceof Date) {
            return Number.isNaN(raw.getTime()) ? new Date(0) : raw;
        }
        const num = Number(raw);
        if (!Number.isNaN(num) && num > 0) {
            return new Date(num < 32503680000 ? num * 1000 : num);
        }
        const parsed = new Date(raw);
        return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
    }

    public static parseDateWithServer(
        dateStr: string | null | undefined,
        serverId?: string | null
    ): Date | null {
        if (!dateStr) return null;
        const trimmed = String(dateStr).trim();
        if (!trimmed) return null;

        if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            const date = new Date(num < 32503680000 ? num * 1000 : num);
            return Number.isNaN(date.getTime()) ? null : date;
        }

        const hasTimezone = /([zZ]|[+-]\d{2}(?::?\d{2})?)$/.test(trimmed);
        if (hasTimezone) {
            const parsed = new Date(trimmed);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }

        const offset = this.getServerOffset(serverId);
        const sign = offset >= 0 ? "+" : "-";
        const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
        const isoStr = trimmed.replace(" ", "T") + `${sign}${pad(offset)}:00`;
        const parsed = new Date(isoStr);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    public static getDistinctBannerId(
        pull: { rawPoolId?: string; bannerId?: string; time?: DateLike },
        serverId?: string | null
    ): string {
        const rawId = pull.rawPoolId || pull.bannerId || "unknown";
        const genericIds = [
            "special",
            "standard",
            "weapon",
            "weap-special",
            "weap-standard",
            "new-player",
            "joint"
        ];
        if (!genericIds.includes(rawId.toLowerCase())) {
            return rawId;
        }
        if (pull.time) {
            const banner = this.findBannerConfigByTime(pull.time, rawId, serverId);
            if (banner) {
                return banner.id;
            }
            const d = new Date(pull.time);
            if (!Number.isNaN(d.getTime())) {
                const month = String(d.getMonth() + 1).padStart(2, "0");
                return `${rawId}_${d.getFullYear()}_${month}`;
            }
        }
        return rawId;
    }

    public static findBannerConfigByTime(
        timestamp: DateLike,
        categoryContext?: string | null,
        serverId?: string | null
    ): BannerData | undefined {
        const time = new Date(timestamp).getTime();
        const targetType = this.resolveTargetType(categoryContext);

        const candidates = banners.filter(b => {
            const dates = this.getBannerDates(b, serverId);
            const startDate = this.parseDateWithServer(dates.startStr, serverId);
            if (!startDate) return false;
            const start = startDate.getTime();
            const endDate = dates.endStr ? this.parseDateWithServer(dates.endStr, serverId) : null;
            const end = endDate ? endDate.getTime() : Infinity;

            if (time < (start - this.BUFFER_MS) || time > (end + this.BUFFER_MS)) {
                return false;
            }

            return this.matchesBannerType(b, targetType);
        });

        if (candidates.length === 0) {
            return undefined;
        }

        candidates.sort((a, b) => {
            const aStart = this.parseDateWithServer(this.getBannerDates(a, serverId).startStr, serverId)?.getTime() || 0;
            const bStart = this.parseDateWithServer(this.getBannerDates(b, serverId).startStr, serverId)?.getTime() || 0;
            return bStart - aStart;
        });

        return candidates[0];
    }

    private static resolveTargetType(categoryContext?: string | null): string | null {
        if (!categoryContext) return null;
        if (categoryContext.includes("weap") || categoryContext.includes("constant")) return "weapon";
        if (categoryContext.includes("new")) return "new-player";
        if (categoryContext.includes("joint")) return "joint";
        if (categoryContext === "standard") return "standard";
        if (categoryContext === "special") return "special";
        return null;
    }

    private static matchesBannerType(banner: BannerData, targetType: string | null): boolean {
        if (targetType) {
            if (targetType === "special") return banner.type === "special";
            if (targetType === "standard") return banner.type === "standard";
            if (targetType === "new-player") return banner.type === "new-player";
            if (targetType === "joint") return banner.type === "joint";
            if (targetType === "weapon") return banner.type === "weapon" || banner.id.includes("weap");
            return true;
        }
        const isBannerWeapon = banner.type === "weapon" || banner.id?.includes("weap");
        return banner.type !== "new-player" && banner.type !== "joint" && !isBannerWeapon;
    }
}
