export function formatDuration(seconds: number | null | undefined, t: (key: string, values?: any) => string): string {
    if (!seconds || isNaN(seconds)) return t("leaderboard.sec", { time: 0 });
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    if (m > 0 && s > 0) return t("leaderboard.min_sec", { m, s });
    if (m > 0) return t("leaderboard.min", { m });
    return t("leaderboard.sec", { time: s });
}

export function formatRelativeTime(updatedAt: string | number | null | undefined, t: (key: string, values?: any) => string): string {
    if (!updatedAt) return "";
    const num = Number(updatedAt);
    const parsed = (!isNaN(num) && isFinite(num))
        ? (num < 1e11 ? num * 1000 : num)
        : new Date(String(updatedAt).replace(" ", "T")).getTime();
    if (isNaN(parsed)) return "";
    const diff = Date.now() - parsed;
    if (diff < 0) return t("profile.time_just_now");
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("profile.time_just_now");
    const hours = Math.floor(mins / 60);
    if (hours < 1) return t("profile.time_hours", { n: hours });
    const days = Math.floor(hours / 24);
    if (days < 1) return t("profile.time_days", { n: days });
    return t("profile.time_days", { n: days });
}

export function getServerLabel(serverId: string | number | null | undefined): string {
    const s = String(serverId);
    if (s === "1") return "Americas/Europe";
    if (s === "2") return "Asia";
    return "";
}

