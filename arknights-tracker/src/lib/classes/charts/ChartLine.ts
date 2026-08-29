export class ChartLine {
    private readonly _values: number[];

    public constructor(values: number[]) {
        this._values = values;
    }

    public get values(): number[] {
        return this._values;
    }

    public getMaxValue(): number {
        return this._values.reduce((max, cur) => cur > max ? cur : max, 1);
    }

    public getSvgPath(height: number, width: number): string | null {
        if (this._values.length === 0) {
            return null;
        }

        if (this._values.length === 1) {
            return `M 0,${height} L ${width},${height}`;
        }

        const max = this.getMaxValue();
        const points = this._values.map((value, index) => ({
            x: index / (this._values.length - 1) * width,
            y: height - value / max * height
        }));

        const result: string[] = [];

        result.push(`M ${points[0].x},${points[0].y}`);

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = i >= 1 ? points[i - 1] : points[i];
            const p2 = points[i];
            const p3 = points[i + 1];
            const p4 = i < points.length - 2 ? points[i + 2] : points[i + 1];

            const cp1x = p2.x + (p3.x - p1.x) / 6;
            const cp1y = p2.y + (p3.y - p1.y) / 6;
            const cp2x = p3.x - (p4.x - p2.x) / 6;
            const cp2y = p3.y - (p4.y - p2.y) / 6;

            result.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p3.x},${p3.y}`);
        }

        return result.join(" ");
    }
}