export async function copyToClipboard(text: string): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        return false;
    }
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

export async function copyTableToClipboard(
    headers: (string | number)[],
    rows: (string | number)[][]
): Promise<boolean> {
    const textData = [
        headers.join("\t"),
        ...rows.map(r => r.join("\t"))
    ].join("\n") + "\n";
    return copyToClipboard(textData);
}

export function formatNumberForSelection(num: number | null | undefined, locale?: string): string {
    if (num === undefined || num === null) return "0";
    const loc = locale ? locale.replace("_", "-") : undefined;
    const formatted = num.toLocaleString(loc);
    return formatted.replace(/[\s\u00A0\u202F]/g, '<span class="select-none"> </span>');
}

