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