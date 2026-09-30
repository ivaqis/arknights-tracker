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

    public getSvgPath(height: number, width: number, topPadding: number = 8): string | null {
        if (this._values.length === 0) {
            return null;
        }

        if (this._values.length === 1) {
            return `M 0,${height} L ${width},${height}`;
        }

        const max = this.getMaxValue();
        const usableHeight = height - topPadding;
        const points = this._values.map((value, index) => ({
            x: (index / (this._values.length - 1)) * width,
            y: height - (value / max) * usableHeight
        }));

        const n = points.length;
        const deltas: number[] = [];
        for (let i = 0; i < n - 1; i++) {
            const dx = points[i + 1].x - points[i].x;
            deltas.push(dx === 0 ? 0 : (points[i + 1].y - points[i].y) / dx);
        }

        const tangents: number[] = [];
        tangents.push(deltas[0]);
        for (let i = 1; i < n - 1; i++) {
            const d0 = deltas[i - 1];
            const d1 = deltas[i];
            if (d0 * d1 <= 0) {
                tangents.push(0);
            } else {
                tangents.push((d0 + d1) / 2);
            }
        }
        tangents.push(deltas[n - 2]);

        for (let i = 0; i < n - 1; i++) {
            const delta = deltas[i];
            if (delta === 0) {
                tangents[i] = 0;
                tangents[i + 1] = 0;
            } else {
                const alpha = tangents[i] / delta;
                const beta = tangents[i + 1] / delta;
                const s = alpha * alpha + beta * beta;
                if (s > 9) {
                    const tau = 3 / Math.sqrt(s);
                    tangents[i] = tau * alpha * delta;
                    tangents[i + 1] = tau * beta * delta;
                }
            }
        }

        const result: string[] = [`M ${points[0].x},${points[0].y}`];
        for (let i = 0; i < n - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const dx = (p2.x - p1.x) / 3;

            const cp1x = p1.x + dx;
            const cp1y = p1.y + tangents[i] * dx;
            const cp2x = p2.x - dx;
            const cp2y = p2.y - tangents[i + 1] * dx;

            result.push(`C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`);
        }

        return result.join(" ");
    }
}