const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function getDayOfWeekStartsWithMonday(ts: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
    const date = new Date(ts);
    const utcDay = date.getUTCDay();

    return (utcDay === 0 ? 6 : utcDay - 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function getWeek(ts: number): number {
    const date = new Date(ts);
    const weekDay = getDayOfWeekStartsWithMonday(ts);
    const dayTs = date.setUTCHours(0, 0, 0, 0);

    const mondayTs = dayTs - weekDay * DAY_MS;

    return Math.floor(mondayTs / WEEK_MS);
}