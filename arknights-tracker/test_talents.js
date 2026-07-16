import assert from 'assert';

// Helper to normalize cultivation nodes
function normalizeCultNodeId(id) {
    if (!id) return null;
    const m1 = id.match(/^spaceship_skill_(.+)_(\d+)_(\d+)$/);
    if (m1) {
        return {
            charId: m1[1],
            skillIdx: parseInt(m1[2], 10),
            level: parseInt(m1[3], 10)
        };
    }
    const m2 = id.match(/^fac_(.+)_(\d+)_(\d+)$/);
    if (m2) {
        return {
            charId: m2[1],
            skillIdx: parseInt(m2[2], 10) + 1,
            level: parseInt(m2[3], 10)
        };
    }
    return null;
}

// Simplified getTalents for verification matching page.svelte logic
function getTalents(char, detailedChar) {
    if (!char?.charData) return [];
    const combatNodes = char.charData.combatTalents || [];
    const latestPassive = detailedChar?.talent?.latestPassiveSkillNodes || [];
    const groupedCombat = {};
    combatNodes.forEach(node => {
        if (!groupedCombat[node.name]) {
            groupedCombat[node.name] = [];
        }
        groupedCombat[node.name].push(node);
    });
    
    const talents = [];
    const combatList = [];
    Object.entries(groupedCombat).forEach(([name, nodes]) => {
        nodes.sort((a, b) => a.id.localeCompare(b.id));
        const levelsCount = nodes.length;
        
        let talentIdx = 0;
        const match = nodes[0]?.id?.match(/passive_skill_(\d+)_/);
        if (match) {
            talentIdx = parseInt(match[1], 10);
        }
        const currentIdx = talentIdx + 1;
        
        const activeNode = latestPassive.find(id => nodes.some(n => n.id === id));
        let currentLevel = 0;
        if (activeNode) {
            currentLevel = nodes.findIndex(n => n.id === activeNode) + 1;
        }

        combatList.push({
            idx: currentIdx,
            data: {
                name,
                type: 'combat',
                currentLevel,
                levelsCount
            }
        });
    });
    combatList.sort((a, b) => a.idx - b.idx);
    combatList.forEach(item => talents.push(item.data));

    const cultNodes = char.charData.cultivationTalents || [];
    const latestFactory = detailedChar?.talent?.latestFactorySkillNodes || detailedChar?.talent?.latestSpaceshipSkillNodes || [];
    const groupedCult = {};
    cultNodes.forEach(node => {
        const baseName = node.name.replace(/\s*[αβγ]\s*$/, "").trim();
        if (!groupedCult[baseName]) {
            groupedCult[baseName] = [];
        }
        groupedCult[baseName].push(node);
    });

    const cultList = [];
    Object.entries(groupedCult).forEach(([baseName, nodes]) => {
        nodes.sort((a, b) => a.id.localeCompare(b.id));
        const levelsCount = nodes.length;

        let skillIdx = 1;
        const fallbackNode = nodes[0] || {};
        if (fallbackNode.id) {
            const parts = fallbackNode.id.split('_');
            if (parts.length >= 2) {
                const parsedIdx = parseInt(parts[parts.length - 2], 10);
                if (!isNaN(parsedIdx)) {
                    skillIdx = parsedIdx;
                }
            }
        }

        const activeNode = latestFactory.find(activeId => {
            const normActive = normalizeCultNodeId(activeId);
            return nodes.some(n => {
                const normN = normalizeCultNodeId(n.id);
                return normActive && normN &&
                    normActive.charId === normN.charId &&
                    normActive.skillIdx === normN.skillIdx &&
                    normActive.level === normN.level;
            });
        });

        let currentLevel = 0;
        if (activeNode) {
            const norm = normalizeCultNodeId(activeNode);
            if (norm) {
                currentLevel = norm.level;
            }
        }

        cultList.push({
            idx: skillIdx,
            data: {
                name: baseName,
                type: 'cultivation',
                currentLevel,
                levelsCount
            }
        });
    });
    cultList.sort((a, b) => a.idx - b.idx);
    cultList.forEach(item => talents.push(item.data));

    return talents;
}

// Self-test with mock data for Arclight (EvolvePhase 1)
const mockArclight = {
    charData: {
        combatTalents: [
            { id: "chr_0007_ikut_passive_skill_0_1", name: "Забег по бездорожью" },
            { id: "chr_0007_ikut_passive_skill_1_2", name: "Мудрость Ханнабит" },
            { id: "chr_0007_ikut_passive_skill_0_2", name: "Забег по бездорожью" },
            { id: "chr_0007_ikut_passive_skill_1_1", name: "Мудрость Ханнабит" }
        ],
        cultivationTalents: [
            { id: "spaceship_skill_chr_0007_ikut_2_1", name: "Традиции ханн α" },
            { id: "spaceship_skill_chr_0007_ikut_1_1", name: "Клинок бездорожья α" },
            { id: "spaceship_skill_chr_0007_ikut_1_2", name: "Клинок бездорожья β" },
            { id: "spaceship_skill_chr_0007_ikut_2_2", name: "Традиции ханн β" }
        ]
    },
    talent: {
        latestPassiveSkillNodes: [ "chr_0007_ikut_passive_skill_0_1", "default_passive_skill_b" ],
        latestFactorySkillNodes: [ "fac_chr_0007_ikut_0_1", "default_factory_skill_b" ]
    }
};

const talents = getTalents(mockArclight, mockArclight);

// Verify Talent 1 is active (level 1)
assert.strictEqual(talents[0].name, "Забег по бездорожью");
assert.strictEqual(talents[0].currentLevel, 1);

// Verify Talent 2 is locked (level 0)
assert.strictEqual(talents[1].name, "Мудрость Ханнабит");
assert.strictEqual(talents[1].currentLevel, 0);

// Verify Base Skill 1 is active (level 1)
assert.strictEqual(talents[2].name, "Клинок бездорожья");
assert.strictEqual(talents[2].currentLevel, 1);

// Verify Base Skill 2 is locked (level 0)
assert.strictEqual(talents[3].name, "Традиции ханн");
assert.strictEqual(talents[3].currentLevel, 0);

console.log("Self-check passed successfully!");
