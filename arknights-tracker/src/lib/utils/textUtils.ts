import { get } from "svelte/store";
import { currentUiLocale, normalizeLocale } from "$lib/stores/locale";

export function formatCount(n: number, locale?: string): string {
    const loc = normalizeLocale(locale || (typeof window !== "undefined" ? get(currentUiLocale) : "en-US"));
    return n.toLocaleString(loc);
}

export function formatRate(rate: number, fractionDigits: number, locale?: string): string {
    const loc = normalizeLocale(locale || (typeof window !== "undefined" ? get(currentUiLocale) : "en-US"));
    const formatter = new Intl.NumberFormat(loc, {
        style: "percent",
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: fractionDigits
    });

    return formatter.format(rate);
}

export function getISODate(date: Date): `${number}-${number}-${number}` {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}` as `${number}-${number}-${number}`;
}

export function getDateFromISOString(iso: `${number}-${number}-${number}`): Date {
    const [year, month, day] = iso.split("-");

    return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10)
    );
}

export function getDateTime(dateStr: `${number}-${number}-${number} ${number}:${number}:${number}` | string): Date {
    const [date, time] = dateStr.split(" ");

    return new Date(`${date}T${time}Z`);
}