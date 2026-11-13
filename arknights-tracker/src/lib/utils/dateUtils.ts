import { normalizeLocale } from "$lib/stores/locale";

export interface DateFormatConfig extends Intl.DateTimeFormatOptions {
    locale?: string;
    serverId?: string;
    showServerTime?: boolean;
}

export function getServerTimeZone(serverId: string = "3"): string {
    return serverId === "2" || serverId === "1" ? "Asia/Shanghai" : "America/New_York";
}

export function getServerOffsetHours(serverId: string = "3"): number {
    return serverId === "2" || serverId === "1" ? 8 : -5;
}

export function parseWithServerOffset(
    dateInput?: string | Date | null,
    serverId: string = "3",
    fallback: Date = new Date(0)
): Date {
    if (!dateInput) return fallback;
    if (dateInput instanceof Date) return dateInput;
    if (typeof dateInput !== "string") return fallback;
    const str = dateInput.replace(/\//g, "-").trim();
    if (str.includes("Z") || (str.includes("T") && (str.includes("+") || str.includes("-")))) {
        const d = new Date(str);
        return isNaN(d.getTime()) ? fallback : d;
    }
    const offset = getServerOffsetHours(serverId);
    const sign = offset >= 0 ? "+" : "-";
    const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
    const formatted = str.includes(":") ? str.replace(" ", "T") : `${str}T00:00:00`;
    const iso = `${formatted}${sign}${pad(offset)}:00`;
    const parsed = new Date(iso);
    return isNaN(parsed.getTime()) ? fallback : parsed;
}

export function parseDateInput(input: string | number | Date, serverId?: string): Date {
    if (input instanceof Date) return input;
    if (typeof input === "number") return new Date(input);
    const str = String(input).trim();
    if (serverId) return parseWithServerOffset(str, serverId);
    const normalized = str.includes(" ") ? str.replace(" ", "T") : str;
    const d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;
    return new Date(str.replace(/\//g, "-"));
}

export function isEventStarted(
    item?: { startTime?: string; startTimeAsia?: string } | null,
    serverId: string = "all",
    now: Date = new Date()
): boolean {
    if (!item) return true;
    if (serverId === "2" || serverId === "1") {
        const str = item.startTimeAsia || item.startTime;
        if (!str) return true;
        return now >= parseWithServerOffset(str, serverId);
    }
    if (serverId === "3") {
        const str = item.startTime;
        if (!str) return true;
        return now >= parseWithServerOffset(str, "3");
    }
    const westStr = item.startTime;
    const asiaStr = item.startTimeAsia || item.startTime;
    const westDate = westStr ? parseWithServerOffset(westStr, "3") : null;
    const asiaDate = asiaStr ? parseWithServerOffset(asiaStr, "2") : null;
    if (!westDate && !asiaDate) return true;
    if (westDate && asiaDate) {
        return now >= westDate || now >= asiaDate;
    }
    return now >= (westDate || asiaDate)!;
}

export function formatDate(
    dateInput?: string | number | Date | null,
    options?: DateFormatConfig,
    config?: DateFormatConfig
): string {
    if (!dateInput) return "";
    const merged: DateFormatConfig = { ...options, ...config };
    const d = typeof dateInput === "string"
        ? (merged.serverId ? parseWithServerOffset(dateInput, merged.serverId) : parseDateInput(dateInput))
        : (dateInput instanceof Date ? dateInput : new Date(dateInput));
    if (isNaN(d.getTime())) return "";
    const loc = normalizeLocale(merged.locale);
    const { locale: _, serverId, showServerTime, ...intlOptions } = merged;
    const finalOptions: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        ...intlOptions
    };
    if (showServerTime) {
        finalOptions.timeZone = getServerTimeZone(serverId);
    }
    try {
        return d.toLocaleString(loc, finalOptions);
    } catch {
        return "";
    }
}

export function formatDateTime(
    dateInput?: string | number | Date | null,
    config?: DateFormatConfig
): string {
    return formatDate(
        dateInput,
        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
        config
    );
}

export function formatDateRange(
    startInput?: string | number | Date | null,
    endInput?: string | number | Date | null,
    config?: DateFormatConfig | string,
    options?: Intl.DateTimeFormatOptions
): string {
    if (!startInput || !endInput) return "";
    const userConfig: DateFormatConfig = typeof config === "string" ? { locale: config } : (config || {});
    const defaultOptions: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
    const customOptions = options || (typeof config === "object" ? config : null);
    const finalOptions: Intl.DateTimeFormatOptions = customOptions ? { ...customOptions } : defaultOptions;
    const start = parseDateInput(startInput, userConfig.serverId);
    const end = parseDateInput(endInput, userConfig.serverId);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return `${String(startInput).slice(0, 10)} - ${String(endInput).slice(0, 10)}`;
    }
    const loc = normalizeLocale(userConfig.locale);
    return `${start.toLocaleDateString(loc, finalOptions)} - ${end.toLocaleDateString(loc, finalOptions)}`;
}
