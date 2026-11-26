import assert from "node:assert/strict";

export async function verifyPulls(vite) {
    const { PullDateHelper } = await vite.ssrLoadModule("/src/lib/classes/pulls/PullDateHelper.ts");
    const { PullPityCalculator } = await vite.ssrLoadModule("/src/lib/classes/pulls/PullPityCalculator.ts");
    const { PullStatsCalculator } = await vite.ssrLoadModule("/src/lib/classes/pulls/PullStatsCalculator.ts");
    const { PullNameCanonicalizer } = await vite.ssrLoadModule("/src/lib/classes/pulls/PullNameCanonicalizer.ts");
    const { PullMerger } = await vite.ssrLoadModule("/src/lib/classes/pulls/PullMerger.ts");
    const { characters } = await vite.ssrLoadModule("/src/lib/data/characters.js");
    const { weapons } = await vite.ssrLoadModule("/src/lib/data/weapons.js");

    assert.equal(PullDateHelper.isGenericBannerId("E_CharacterGachaPoolType_Special"), true);
    assert.equal(PullDateHelper.isGenericBannerId("E_CharacterGachaPoolType_Standard"), true);
    assert.equal(PullDateHelper.isGenericBannerId("E_WeaponGachaPoolType_Special"), true);
    assert.equal(PullDateHelper.isGenericBannerId("special_1_4_2"), false);

    assert.equal(
        PullDateHelper.getDistinctBannerId(
            { time: "2026-09-02T02:42:48.998Z", rawPoolId: "E_CharacterGachaPoolType_Special", bannerId: "special" },
            "3"
        ),
        "special_1_5_1"
    );
    assert.equal(
        PullDateHelper.getDistinctBannerId(
            { time: "2026-11-25T08:08:28.812Z", rawPoolId: "E_CharacterGachaPoolType_Special", bannerId: "special" },
            "3"
        ),
        "special_1_7_1"
    );

    const staleAndCrossBanner = [
        ...Array.from({ length: 50 }, (_, i) => ({
            id: `b162_${i}`,
            time: new Date("2026-11-06T10:00:00Z"),
            name: "Akekuri",
            rarity: 4,
            bannerId: "special",
            rawPoolId: "E_CharacterGachaPoolType_Special",
            isFree: false,
            seqId: i + 1
        })),
        ...Array.from({ length: 84 }, (_, i) => ({
            id: `b171_${i}`,
            time: new Date("2026-11-25T08:08:28Z"),
            name: i === 83 ? "Kay" : "Akekuri",
            rarity: i === 83 ? 6 : 4,
            bannerId: "special",
            rawPoolId: "E_CharacterGachaPoolType_Special",
            isFree: false,
            status: i === 83 ? "guaranteed" : undefined,
            isGuaranteed: i === 83 ? true : undefined,
            seqId: 100 + i
        }))
    ];

    const withPity = PullPityCalculator.calculate(staleAndCrossBanner, "special", "3");
    const stats = PullStatsCalculator.calculate(withPity, "special", "3");
    const kayPull = withPity.find((p) => p.id === "b171_83");

    assert.equal(kayPull.status, "won");
    assert.equal(kayPull.isGuaranteed, false);
    assert.equal(stats.guarantee120, 0);
    assert.equal(stats.hasReceivedRateUp, true);

    const doubleRateUp = [
        ...Array.from({ length: 10 }, (_, i) => ({
            id: `d1_${i}`,
            time: new Date("2026-11-25T10:00:00Z"),
            name: i === 5 ? "Kay" : "Akekuri",
            rarity: i === 5 ? 6 : 4,
            bannerId: "special",
            rawPoolId: "E_CharacterGachaPoolType_Special",
            seqId: i + 1
        })),
        ...Array.from({ length: 121 }, (_, i) => ({
            id: `d2_${i}`,
            time: new Date("2026-11-26T10:00:00Z"),
            name: i === 120 ? "Kay" : "Akekuri",
            rarity: i === 120 ? 6 : 4,
            bannerId: "special",
            rawPoolId: "E_CharacterGachaPoolType_Special",
            seqId: 100 + i
        }))
    ];

    PullStatsCalculator.calculate(doubleRateUp, "special", "3");
    assert.equal(doubleRateUp.find((p) => p.id === "d1_5").status, "won");
    assert.equal(doubleRateUp.find((p) => p.id === "d2_120").status, "won");
    assert.equal(doubleRateUp.find((p) => p.id === "d2_120").isGuaranteed, false);

    assert.equal(PullNameCanonicalizer.canonicalize("kay"), "Kay");
    assert.equal(PullNameCanonicalizer.canonicalize("Contingent Measure"), "Prominent Edge");
    for (const c of Object.values(characters)) {
        if (c.name) assert.equal(PullNameCanonicalizer.canonicalize(c.name.toLowerCase()), c.name);
    }
    for (const w of Object.values(weapons)) {
        if (w.name) assert.equal(PullNameCanonicalizer.canonicalize(w.name.toLowerCase()), w.name);
    }

    const oldList = [
        { id: "t1", time: "2026-11-25T08:00:00Z", name: "kay", rarity: 6, bannerId: "special", seqId: 10 },
        { id: "bad", time: "1999-01-01T00:00:00Z", name: "Invalid", rarity: 4, bannerId: "special", seqId: 1 }
    ];
    const newList = [
        { id: "t1", time: "2026-11-25T08:00:00Z", name: "Kay", rarity: 6, bannerId: "special", seqId: 10 },
        { id: "t2", time: "2026-11-25T08:01:00Z", name: "Ember", rarity: 6, bannerId: "special", seqId: 11 }
    ];
    const report = PullMerger.mergePullsWithReport(oldList, newList);
    assert.equal(report.addedCount, 1);
    assert.equal(report.merged.length, 2);
    assert.equal(report.merged[0].name, "Kay");

    return { checkedPulls: withPity.length + doubleRateUp.length };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
    const { createServer } = await import("vite");
    const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
    try {
        console.log("PASS pulls", await verifyPulls(vite));
    } finally {
        await vite.close();
    }
}

