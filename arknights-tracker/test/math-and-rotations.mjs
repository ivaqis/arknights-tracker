import assert from "node:assert/strict";

export async function verifyMathAndRotations(vite) {
    const { evaluateSafeMath, interpolateBlackboard } = await vite.ssrLoadModule("/src/lib/utils/blackboardUtils.ts");
    const { weaponRotations } = await vite.ssrLoadModule("/src/lib/data/weaponRotations.js");

    assert.equal(evaluateSafeMath("1 + 2 * 3"), 7);
    assert.equal(evaluateSafeMath("(1 + 2) * -3.5"), -10.5);
    assert.equal(evaluateSafeMath("-(10 - 4) / 2"), -3);
    assert.throws(() => evaluateSafeMath("1 / 0"));
    assert.throws(() => evaluateSafeMath("1 + * 2"));

    const interpolated = interpolateBlackboard(
        "DMG +{atk:0%}, -{cost:0}",
        { atk: 0.25, cost: 3.6 },
        { wrapSpan: false }
    );
    assert.equal(interpolated, "DMG +25%, -4");

    const weeks = weaponRotations.weeklyRotations;
    assert.ok(weeks.length > 0, "weeklyRotations must not be empty");
    for (let i = 0; i < weeks.length; i++) {
        const w = weeks[i];
        const s = new Date(w.startDate.replaceAll("/", "-") + "T00:00:00Z");
        const e = new Date(w.endDate.replaceAll("/", "-") + "T00:00:00Z");
        assert.ok(!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()), `Invalid dates in week ${w.week}`);
        assert.ok(e > s, `endDate must be after startDate in week ${w.week}`);
        if (i > 0) {
            assert.equal(w.startDate, weeks[i - 1].endDate, `Gap between week ${weeks[i - 1].week} and ${w.week}`);
        }
    }

    const CYCLE = ["A", "B", "C"];
    const BASE = Date.UTC(2026, 0, 22);
    const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const weaponsFor = (y, m, d) => {
        const tplKey = CYCLE[Math.floor((Date.UTC(y, m, d) - BASE) / (7 * 86400000)) % 3];
        return weaponRotations.dailyTemplates[tplKey][dayKeys[new Date(Date.UTC(y, m, d)).getUTCDay()]];
    };

    assert.deepEqual(weaponsFor(2026, 10, 25), ["ancientCanal", "monaihe"]);
    assert.deepEqual(weaponsFor(2026, 10, 26), ["monaihe", "aspirant"]);

    return { weeks: weeks.length };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
    const { createServer } = await import("vite");
    const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
    try {
        console.log("PASS math-and-rotations", await verifyMathAndRotations(vite));
    } finally {
        await vite.close();
    }
}

