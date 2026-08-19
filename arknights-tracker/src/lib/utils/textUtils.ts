export function formatCount(n: number): string {
    return n
        .toLocaleString("ru-RU")
        .replace(",", ".");
}

export function formatRate(rate: number, fractionDigits: number): string {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "percent",
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: fractionDigits
    });

    return formatter.format(rate);
}